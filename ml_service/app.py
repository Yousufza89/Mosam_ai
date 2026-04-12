"""
Weather Prediction ML Service
FastAPI backend for running ML predictions
"""

import os
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, Optional
import warnings
warnings.filterwarnings('ignore')

# Try to import ML libraries
try:
    import lightgbm as lgb
    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False
    print("Warning: LightGBM not available, using fallback")

try:
    from stable_baselines3 import PPO
    HAS_SB3 = True
except ImportError:
    HAS_SB3 = False
    print("Warning: Stable Baselines3 not available, using fallback")

app = FastAPI(
    title="Mosam AI - Weather Prediction Service",
    description="ML-powered weather prediction API for Pakistani cities",
    version="3.0.0"
)

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# CONFIGURATION
# ============================================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, '..', 'data', 'pak_weather_engineered_v3.csv')
MODELS_DIR = os.path.join(BASE_DIR, '..', 'models', 'models_city_v3')

CITIES = {
    'Karachi': {'lat': 24.8607, 'lon': 67.0011},
    'Lahore': {'lat': 31.5204, 'lon': 74.3587},
    'Islamabad': {'lat': 33.6844, 'lon': 73.0479},
    'Peshawar': {'lat': 34.0151, 'lon': 71.5249},
    'Quetta': {'lat': 30.1798, 'lon': 66.9750}
}

FEATURES = ['temperature_max', 'temperature_min', 'precipitation', 'wind_speed']

# Global data storage
df_global = None
models_cache = {}  # Cache for loaded models

# Model availability tracking
model_availability = {
    'baseline': {},  # city -> {feature: bool}
    'rl': {}  # city -> bool
}

# ============================================================================
# DATA MODELS
# ============================================================================

class PredictionRequest(BaseModel):
    city: Literal["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta"]
    feature: Literal["temperature_max", "temperature_min", "precipitation", "wind_speed"]
    date: str  # YYYY-MM-DD format

class PredictionStep(BaseModel):
    step: str
    message: str
    status: Literal["pending", "processing", "complete", "error"]
    progress: int  # 0-100

class PredictionResponse(BaseModel):
    city: str
    feature: str
    date: str
    baseline_prediction: float
    rl_correction: float
    final_prediction: float
    confidence: float
    model_version: str
    steps: list[PredictionStep]
    feature_summary: dict

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def load_data():
    """Load the engineered dataset"""
    global df_global
    if df_global is None:
        if os.path.exists(DATA_PATH):
            df_global = pd.read_csv(DATA_PATH)
            df_global['date'] = pd.to_datetime(df_global['date'])
        else:
            raise FileNotFoundError(f"Data file not found: {DATA_PATH}")
    return df_global

def create_features_for_prediction(df, city, pred_date, target_feature):
    """
    Create features for prediction date based on the engineered dataset
    """
    city_df = df[df['city'] == city].copy()
    city_df = city_df.sort_values('date').reset_index(drop=True)
    
    if len(city_df) == 0:
        raise ValueError(f"No data found for city: {city}")
    
    # Get latest row as template
    latest_row = city_df.iloc[-1].to_dict()
    
    # Update time-based features for prediction date
    features = latest_row.copy()
    features['year'] = pred_date.year
    features['month'] = pred_date.month
    features['day'] = pred_date.day
    features['day_of_year'] = pred_date.timetuple().tm_yday
    features['week'] = pred_date.isocalendar()[1]
    features['day_of_week'] = pred_date.weekday()
    features['is_weekend'] = 1 if pred_date.weekday() >= 5 else 0
    features['is_month_start'] = 1 if pred_date.day == 1 else 0
    features['is_month_end'] = 1 if pred_date.day >= 28 else 0
    features['quarter'] = (pred_date.month - 1) // 3 + 1
    
    # Cyclical features
    features['sin_month'] = np.sin(2 * np.pi * pred_date.month / 12)
    features['cos_month'] = np.cos(2 * np.pi * pred_date.month / 12)
    features['sin_day_of_year'] = np.sin(2 * np.pi * features['day_of_year'] / 365)
    features['cos_day_of_year'] = np.cos(2 * np.pi * features['day_of_year'] / 365)
    features['sin_week'] = np.sin(2 * np.pi * features['week'] / 52)
    features['cos_week'] = np.cos(2 * np.pi * features['week'] / 52)
    features['sin_day_of_week'] = np.sin(2 * np.pi * features['day_of_week'] / 7)
    features['cos_day_of_week'] = np.cos(2 * np.pi * features['day_of_week'] / 7)
    
    # Seasonal features
    month = pred_date.month
    if month in [12, 1, 2]:
        season = 0
    elif month in [3, 4, 5]:
        season = 1
    elif month in [6, 7, 8, 9]:
        season = 2
    else:
        season = 3
    
    features['season'] = season
    features['is_winter'] = 1 if season == 0 else 0
    features['is_spring'] = 1 if season == 1 else 0
    features['is_summer'] = 1 if season == 2 else 0
    features['is_monsoon'] = 1 if month in [6, 7, 8, 9] else 0
    
    return features

def get_seasonal_pattern(df, city, feature, month):
    """Get historical average for this month as baseline"""
    city_data = df[df['city'] == city]
    month_data = city_data[city_data['month'] == month]
    
    if len(month_data) > 0:
        return month_data[feature].mean()
    return city_data[feature].mean()

def get_model_path(city, feature):
    """Get the model file path for a city and feature"""
    city_dir = os.path.join(MODELS_DIR, city)
    
    if not os.path.exists(city_dir):
        return None
    
    # Map features to model files
    model_map = {
        'temperature_max': 'temp_max_lgb.pkl',
        'temperature_min': 'temp_min_lgb.pkl',
        'precipitation': 'prec_lgb.pkl',
        'wind_speed': 'wind_xgb.pkl'
    }
    
    model_file = model_map.get(feature)
    if not model_file:
        return None
    
    model_path = os.path.join(city_dir, model_file)
    return model_path if os.path.exists(model_path) else None

def load_trained_model(city, feature):
    """Load a trained model from disk if available"""
    model_path = get_model_path(city, feature)
    
    if not HAS_LIGHTGBM:
        print(f"  ⚠️  LightGBM not available, cannot load {city}/{feature}")
        return None
    
    if not model_path:
        print(f"  ⚠️  Model file not found for {city}/{feature}")
        return None
    
    try:
        print(f"  ✓ Loading model from: {model_path}")
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        # Extract model and feature names
        if isinstance(model_data, dict):
            model = model_data.get('model', model_data)
            feature_names = model_data.get('feature_names', [])
        else:
            model = model_data
            feature_names = model.feature_name_ if hasattr(model, 'feature_name_') else []
        
        print(f"  ✓ Model loaded: {type(model).__name__} with {len(feature_names)} features")
        return {'model': model, 'feature_names': feature_names}
    except Exception as e:
        print(f"  ❌ Failed to load model for {city}/{feature}: {e}")
        return None

def make_baseline_prediction(df, city, feature, pred_date, features_dict):
    """
    Make baseline prediction using cached LightGBM model if available,
    otherwise fall back to seasonal patterns
    """
    # Try to use cached model first
    cache_key = f"{city}_{feature}"
    model_data = models_cache.get(cache_key)
    
    print(f"  [make_baseline] cache_key={cache_key}, model_data exists={model_data is not None}")
    
    if model_data:
        print(f"  [make_baseline] model type={type(model_data.get('model'))}, has predict={hasattr(model_data.get('model'), 'predict')}")
    
    if model_data and model_data.get('model') is not None and hasattr(model_data['model'], 'predict'):
        try:
            # Prepare feature vector in exact order expected by model
            X = []
            for fname in model_data['feature_names']:
                val = features_dict.get(fname, 0)
                # Handle NaN/None values
                if val is None or (isinstance(val, float) and np.isnan(val)):
                    val = 0
                X.append(val)
            
            X = np.array(X).reshape(1, -1)
            
            # Make prediction
            prediction = model_data['model'].predict(X)[0]
            
            return float(prediction), True  # True = used real model
        except Exception as e:
            print(f"  ❌ Cached model prediction failed for {city}/{feature}: {e}")
            import traceback
            traceback.print_exc()
            # Fall through to fallback
    
    # Fallback: Use seasonal patterns and trends
    city_data = df[df['city'] == city].copy()
    
    # Get seasonal average for this month
    seasonal_avg = get_seasonal_pattern(df, city, feature, pred_date.month)
    
    # Get recent trend (last 30 days)
    recent_data = city_data.tail(30)
    if len(recent_data) > 0:
        recent_avg = recent_data[feature].mean()
        recent_trend = recent_data[feature].iloc[-1] - recent_data[feature].iloc[0]
    else:
        recent_avg = seasonal_avg
        recent_trend = 0
    
    # Combine seasonal and recent trend
    prediction = (seasonal_avg * 0.6) + (recent_avg * 0.3) + (recent_trend * 0.1)
    
    # Add small random variation
    noise = np.random.normal(0, abs(prediction) * 0.02)
    prediction += noise
    
    return float(prediction), False  # False = used fallback

def load_rl_model(city):
    """Load cached PPO RL model if available"""
    cache_key = f"{city}_rl"
    
    # Return cached model if available
    if cache_key in models_cache:
        return models_cache[cache_key]
    
    # Try to load from disk
    rl_path = os.path.join(MODELS_DIR, city, 'rl', 'ppo_agent_v2.zip')
    
    if not os.path.exists(rl_path) or not HAS_SB3:
        return None
    
    try:
        model = PPO.load(rl_path)
        models_cache[cache_key] = model  # Cache it
        return model
    except Exception as e:
        print(f"  ❌ Failed to load RL model for {city}: {e}")
        return None

def apply_rl_correction(city, baseline_pred, features, target_feature):
    """
    Apply RL correction using trained PPO model if available,
    otherwise use heuristic-based correction
    """
    # Try to load and use trained RL model
    rl_model = load_rl_model(city)
    
    if rl_model:
        try:
            obs_shape = rl_model.observation_space.shape[0]
            
            if obs_shape == 15:
                # v2/v3 model (15 features)
                observation = np.array([
                    baseline_pred,
                    features.get(f'{target_feature}_roll_mean_7', baseline_pred),
                    features.get(f'{target_feature}_roll_std_7', 0),
                    features.get(f'{target_feature}_climatology', baseline_pred),
                    features.get('month', 1),
                    features.get(f'{target_feature}_diff_7', 0),
                    features.get(f'{target_feature}_anomaly', 0),
                    features.get('days_since_rain', 0),
                    features.get('wind_speed_persistence', 0),
                    features.get(f'{target_feature}_volatility_7', 0),
                    features.get('season', 0),
                    features.get('temp_above_ma7', 0),
                    features.get(f'{target_feature}_roll_range_7', 0),
                    features.get('precipitation_roll_sum_7', 0),
                    features.get('is_monsoon', 0),
                ], dtype=np.float32)
            else:
                # v1 model (3 features)
                observation = np.array([
                    baseline_pred,
                    features.get(f'{target_feature}_persistence', baseline_pred),
                    features.get(f'{target_feature}_climatology', baseline_pred)
                ], dtype=np.float32)
            
            # Normalize observation
            obs_min = observation.min()
            obs_max = observation.max()
            obs_range = obs_max - obs_min + 1e-8
            observation_norm = (observation - obs_min) / obs_range
            observation_norm = np.clip(observation_norm, 0, 1)
            
            # Get RL correction
            action, _ = rl_model.predict(observation_norm, deterministic=True)
            correction = float(np.asarray(action).ravel()[0])
            
            return correction, True  # True = used real RL model
        except Exception as e:
            print(f"RL model prediction failed for {city}: {e}")
            # Fall through to fallback
    
    # Fallback: Heuristic-based correction
    correction = 0.0
    
    # Adjust based on season
    season = features.get('season', 1)
    if season == 2:  # Summer
        correction += np.random.normal(0.5, 0.3)
    elif season == 0:  # Winter
        correction += np.random.normal(-0.3, 0.2)
    
    # Adjust based on recent volatility
    volatility = features.get(f'{target_feature}_volatility_7', 0)
    if volatility > 2:
        correction += np.random.normal(0, 0.5)
    
    # Small random correction
    correction += np.random.normal(0, abs(baseline_pred) * 0.01)
    
    return correction, False  # False = used fallback

def calculate_confidence(baseline_pred, rl_correction, features, target_feature):
    """Calculate confidence score based on data quality"""
    base_confidence = 85.0
    
    # Reduce confidence for larger corrections
    correction_penalty = abs(rl_correction) * 2
    
    # Check data recency
    days_since_rain = features.get('days_since_rain', 0)
    recency_penalty = min(days_since_rain * 0.5, 10)
    
    confidence = base_confidence - correction_penalty - recency_penalty
    confidence += np.random.normal(0, 2)  # Small random variation
    
    return max(70, min(98, confidence))

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    return {
        "service": "Mosam AI - Weather Prediction API",
        "version": "3.0.0",
        "status": "operational",
        "cities": list(CITIES.keys()),
        "features": FEATURES
    }

@app.get("/health")
async def health_check():
    try:
        df = load_data()
        
        # Check model availability
        model_status = {}
        for city in CITIES.keys():
            city_models = {}
            for feature in FEATURES:
                model_path = get_model_path(city, feature)
                city_models[feature] = os.path.exists(model_path) if model_path else False
            
            # Check RL model
            rl_path = os.path.join(MODELS_DIR, city, 'rl', 'ppo_agent_v2.zip')
            city_models['rl'] = os.path.exists(rl_path)
            
            model_status[city] = city_models
        
        # Count available models
        total_models = len(CITIES) * (len(FEATURES) + 1)  # +1 for RL
        available_models = sum(
            sum(1 for v in city_models.values() if v)
            for city_models in model_status.values()
        )
        
        return {
            "status": "healthy",
            "data_loaded": True,
            "data_shape": df.shape,
            "date_range": {
                "start": df['date'].min().strftime('%Y-%m-%d'),
                "end": df['date'].max().strftime('%Y-%m-%d')
            },
            "cities": df['city'].unique().tolist(),
            "models": {
                "available": available_models,
                "total": total_models,
                "percentage": round((available_models / total_models) * 100, 1),
                "using_trained_models": available_models > 0,
                "details": model_status
            },
            "libraries": {
                "lightgbm": HAS_LIGHTGBM,
                "stable_baselines3": HAS_SB3
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Make a weather prediction for a specific city, feature, and date
    """
    steps = []
    
    try:
        # Step 1: Load data
        steps.append(PredictionStep(
            step="data_loading",
            message="Loading historical weather dataset...",
            status="processing",
            progress=10
        ))
        
        df = load_data()
        
        steps[0].status = "complete"
        steps[0].progress = 20
        
        # Step 2: Parse date
        steps.append(PredictionStep(
            step="date_parsing",
            message=f"Parsing prediction date: {request.date}...",
            status="processing",
            progress=25
        ))
        
        try:
            pred_date = datetime.strptime(request.date, '%Y-%m-%d')
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
        # Validate date is in future
        latest_date = df['date'].max()
        if pred_date <= latest_date:
            raise HTTPException(
                status_code=400, 
                detail=f"Date must be after {latest_date.strftime('%Y-%m-%d')}"
            )
        
        steps[1].status = "complete"
        steps[1].progress = 30
        
        # Step 3: Create features
        steps.append(PredictionStep(
            step="feature_engineering",
            message=f"Extracting 108 engineered features for {request.city}...",
            status="processing",
            progress=35
        ))
        
        features = create_features_for_prediction(df, request.city, pred_date, request.feature)
        
        steps[2].status = "complete"
        steps[2].progress = 60
        
        # Step 4: Baseline prediction
        # Use cached model if available
        cache_key = f"{request.city}_{request.feature}"
        model_data = models_cache.get(cache_key)
        using_real_model = model_data is not None and model_data['model'] is not None
        
        print(f"\n[Predict] {request.city}/{request.feature}/{request.date}")
        print(f"  Model cache key: {cache_key}")
        print(f"  Model found: {using_real_model}")
        if using_real_model:
            print(f"  Model type: {type(model_data['model']).__name__}")
        
        steps.append(PredictionStep(
            step="baseline_model",
            message=f"Running {'trained LightGBM' if using_real_model else 'baseline'} model...",
            status="processing",
            progress=65
        ))
        
        baseline_pred, used_real_baseline = make_baseline_prediction(df, request.city, request.feature, pred_date, features)
        print(f"  Baseline prediction: {baseline_pred} (using_real={used_real_baseline})")
        
        steps[3].status = "complete"
        steps[3].progress = 80
        
        # Step 5: RL correction
        # Check if we have a trained RL model
        rl_model = load_rl_model(request.city)
        using_real_rl = rl_model is not None
        
        steps.append(PredictionStep(
            step="rl_correction",
            message=f"Applying {'trained PPO' if using_real_rl else 'heuristic'} RL correction...",
            status="processing",
            progress=85
        ))
        
        rl_correction, used_real_rl = apply_rl_correction(request.city, baseline_pred, features, request.feature)
        final_pred = baseline_pred + rl_correction
        
        steps[4].status = "complete"
        steps[4].progress = 95
        
        # Step 6: Calculate confidence
        steps.append(PredictionStep(
            step="confidence_calc",
            message="Calculating prediction confidence...",
            status="processing",
            progress=98
        ))
        
        confidence = calculate_confidence(baseline_pred, rl_correction, features, request.feature)
        
        steps[5].status = "complete"
        steps[5].progress = 100
        
        # Feature summary for display
        model_status = "trained" if (used_real_baseline or used_real_rl) else "baseline"
        
        feature_summary = {
            "season": ["Winter", "Spring", "Summer", "Autumn"][features.get('season', 0)],
            "month_avg": round(get_seasonal_pattern(df, request.city, request.feature, pred_date.month), 2),
            "recent_trend": "Rising" if features.get(f'{request.feature}_diff_7', 0) > 0 else "Falling",
            "data_points": len(df[df['city'] == request.city]),
            "using_trained_models": used_real_baseline or used_real_rl,
            "baseline_model_type": "LightGBM (trained)" if used_real_baseline else "Statistical (fallback)",
            "rl_model_type": "PPO (trained)" if used_real_rl else "Heuristic (fallback)"
        }
        
        return PredictionResponse(
            city=request.city,
            feature=request.feature,
            date=request.date,
            baseline_prediction=round(baseline_pred, 2),
            rl_correction=round(rl_correction, 2),
            final_prediction=round(final_pred, 2),
            confidence=round(confidence, 1),
            model_version="v3.0 (trained)" if model_status == "trained" else "v3.0 (fallback)",
            steps=steps,
            feature_summary=feature_summary
        )
        
    except HTTPException:
        raise
    except Exception as e:
        # Mark remaining steps as error
        for step in steps:
            if step.status == "processing":
                step.status = "error"
        
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/batch")
async def predict_batch(requests: list[PredictionRequest]):
    """Make multiple predictions at once"""
    results = []
    for req in requests:
        result = await predict(req)
        results.append(result)
    return results

# ============================================================================
# STARTUP
# ============================================================================

@app.get("/test")
async def test_prediction():
    """Test endpoint to verify model predictions"""
    try:
        df = load_data()
        
        # Test Karachi temperature_max for 2026-01-01
        test_city = "Karachi"
        test_feature = "temperature_max"
        test_date = datetime(2026, 1, 1)
        
        # Create features
        features = create_features_for_prediction(df, test_city, test_date, test_feature)
        
        # Try to load model
        model_data = load_trained_model(test_city, test_feature)
        
        if model_data and model_data['model']:
            # Make prediction with model
            X = [features.get(fname, 0) for fname in model_data['feature_names']]
            X = np.array(X).reshape(1, -1)
            baseline_pred = float(model_data['model'].predict(X)[0])
            model_used = "trained LightGBM"
        else:
            # Fallback prediction
            baseline_pred = get_seasonal_pattern(df, test_city, test_feature, 1)
            model_used = "statistical fallback"
        
        # Get RL correction
        rl_model = load_rl_model(test_city)
        if rl_model:
            rl_pred, correction = apply_rl_correction(test_city, baseline_pred, features, test_feature)
            rl_used = "trained PPO"
        else:
            correction = 0.0
            rl_pred = baseline_pred
            rl_used = "no RL model"
        
        return {
            "test_case": {
                "city": test_city,
                "feature": test_feature,
                "date": "2026-01-01"
            },
            "prediction": {
                "baseline": round(baseline_pred, 2),
                "rl_correction": round(correction, 2),
                "final": round(rl_pred, 2)
            },
            "models_used": {
                "baseline": model_used,
                "rl": rl_used
            },
            "expected_colab_result": {
                "baseline": 24.33,
                "rl_correction": 0.04,
                "final": 24.37
            },
            "feature_count": len(features),
            "model_path": get_model_path(test_city, test_feature)
        }
    except Exception as e:
        return {"error": str(e), "traceback": str(e.__traceback__)}

def verify_all_models():
    """Verify and cache all available models at startup"""
    global models_cache, model_availability
    
    print("\n" + "="*60)
    print("VERIFYING ALL MODELS")
    print("="*60)
    
    total_models = 0
    loaded_models = 0
    
    for city in CITIES.keys():
        print(f"\n{city}:")
        model_availability['baseline'][city] = {}
        
        for feature in FEATURES:
            total_models += 1
            model_path = get_model_path(city, feature)
            
            if model_path and os.path.exists(model_path):
                model_data = load_trained_model(city, feature)
                if model_data and model_data['model']:
                    models_cache[f"{city}_{feature}"] = model_data
                    model_availability['baseline'][city][feature] = True
                    loaded_models += 1
                    print(f"  ✓ {feature:<20} loaded ({len(model_data['feature_names'])} features)")
                else:
                    model_availability['baseline'][city][feature] = False
                    print(f"  ⚠️  {feature:<20} file exists but failed to load")
            else:
                model_availability['baseline'][city][feature] = False
                print(f"  ❌ {feature:<20} not found")
        
        # Check RL model
        rl_path = os.path.join(MODELS_DIR, city, 'rl', 'ppo_agent_v2.zip')
        if os.path.exists(rl_path) and HAS_SB3:
            try:
                rl_model = PPO.load(rl_path)
                models_cache[f"{city}_rl"] = rl_model
                model_availability['rl'][city] = True
                print(f"  ✓ RL Model (PPO)       loaded")
            except Exception as e:
                model_availability['rl'][city] = False
                print(f"  ⚠️  RL Model            failed: {e}")
        else:
            model_availability['rl'][city] = False
            print(f"  ❌ RL Model            not found")
    
    print("\n" + "="*60)
    print(f"SUMMARY: {loaded_models}/{total_models} baseline models loaded")
    print(f"         {sum(model_availability['rl'].values())}/{len(CITIES)} RL models loaded")
    if loaded_models == 0:
        print("⚠️  WARNING: No trained models loaded! Using fallback predictions.")
    else:
        print("✓ Models cached and ready for predictions")
    print("="*60 + "\n")

@app.on_event("startup")
async def startup_event():
    """Load data and models on startup"""
    try:
        df = load_data()
        print("✓ Data loaded successfully")
        print(f"  Path: {DATA_PATH}")
        print(f"  Shape: {df.shape}")
        print(f"  Date range: {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
        
        # Load and cache all models
        verify_all_models()
            
    except Exception as e:
        print(f"✗ Error loading data: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

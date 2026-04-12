"""
Model Checker - Verifies that trained models are available and loadable
"""

import os
import sys

# Check if models directory exists
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta']
FEATURES = {
    'temperature_max': 'temp_max_lgb.pkl',
    'temperature_min': 'temp_min_lgb.pkl',
    'precipitation': 'prec_lgb.pkl',
    'wind_speed': 'wind_xgb.pkl'
}

def check_models():
    """Check if all required model files exist"""
    print("=" * 70)
    print("MOSAM AI - Model File Check")
    print("=" * 70)
    
    if not os.path.exists(MODELS_DIR):
        print(f"\n❌ Models directory not found: {MODELS_DIR}")
        print("\nTo fix this:")
        print("1. Copy your trained models from Google Drive")
        print("2. Place them in: ml_service/models/")
        print("3. See MODELS_README.md for details")
        return False
    
    print(f"\n✓ Models directory found: {MODELS_DIR}\n")
    
    all_found = True
    missing_models = []
    
    for city in CITIES:
        city_dir = os.path.join(MODELS_DIR, city)
        print(f"\n{city}:")
        print("-" * 40)
        
        if not os.path.exists(city_dir):
            print(f"  ❌ City directory missing: {city_dir}")
            all_found = False
            missing_models.append(f"{city}/[all models]")
            continue
        
        # Check baseline models
        for feature, filename in FEATURES.items():
            model_path = os.path.join(city_dir, filename)
            if os.path.exists(model_path):
                size_kb = os.path.getsize(model_path) / 1024
                print(f"  ✓ {filename:<20} ({size_kb:.1f} KB)")
            else:
                print(f"  ❌ {filename:<20} NOT FOUND")
                all_found = False
                missing_models.append(f"{city}/{filename}")
        
        # Check RL model
        rl_path = os.path.join(city_dir, 'rl', 'ppo_agent_v2.zip')
        if os.path.exists(rl_path):
            size_kb = os.path.getsize(rl_path) / 1024
            print(f"  ✓ ppo_agent_v2.zip     ({size_kb:.1f} KB)")
        else:
            print(f"  ❌ ppo_agent_v2.zip     NOT FOUND")
            all_found = False
            missing_models.append(f"{city}/rl/ppo_agent_v2.zip")
    
    print("\n" + "=" * 70)
    if all_found:
        print("✅ ALL MODELS FOUND!")
        print("\nYou can now run the ML service with trained models:")
        print("  python app.py")
        return True
    else:
        print(f"⚠️  {len(missing_models)} MODELS MISSING")
        print("\nMissing files:")
        for m in missing_models:
            print(f"  - {m}")
        print("\nThe service will use fallback predictions.")
        print("To use trained models, copy them from your Google Drive.")
        print("See MODELS_README.md for instructions.")
        return False

def test_model_loading():
    """Try to load the models to verify they work"""
    print("\n" + "=" * 70)
    print("Testing Model Loading")
    print("=" * 70)
    
    try:
        import lightgbm as lgb
        print("✓ LightGBM imported successfully")
    except ImportError:
        print("❌ LightGBM not installed: pip install lightgbm")
        return
    
    try:
        from stable_baselines3 import PPO
        print("✓ Stable Baselines3 imported successfully")
    except ImportError:
        print("❌ Stable Baselines3 not installed: pip install stable-baselines3")
        return
    
    import pickle
    
    # Try to load one model
    test_city = 'Karachi'
    test_model = os.path.join(MODELS_DIR, test_city, 'temp_max_lgb.pkl')
    
    if os.path.exists(test_model):
        try:
            with open(test_model, 'rb') as f:
                model_data = pickle.load(f)
            print(f"✓ Successfully loaded {test_city}/temp_max_lgb.pkl")
            
            if isinstance(model_data, dict):
                print(f"  Model type: {type(model_data.get('model', model_data))}")
            else:
                print(f"  Model type: {type(model_data)}")
        except Exception as e:
            print(f"❌ Failed to load {test_city}/temp_max_lgb.pkl: {e}")
    
    # Try to load RL model
    test_rl = os.path.join(MODELS_DIR, test_city, 'rl', 'ppo_agent_v2.zip')
    if os.path.exists(test_rl):
        try:
            model = PPO.load(test_rl)
            print(f"✓ Successfully loaded {test_city}/rl/ppo_agent_v2.zip")
            print(f"  Observation space: {model.observation_space.shape}")
        except Exception as e:
            print(f"❌ Failed to load RL model: {e}")

if __name__ == "__main__":
    found = check_models()
    if found:
        test_model_loading()
    
    print("\n" + "=" * 70)
    print("Press Enter to exit...")
    input()

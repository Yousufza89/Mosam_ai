# Model Files Setup

## Required Model Files

To use your trained ML models for real predictions, you need to copy the model files from your Google Drive / Colab training environment.

## Required Directory Structure

```
ml_service/
├── models/
│   ├── Karachi/
│   │   ├── temp_max_lgb.pkl
│   │   ├── temp_min_lgb.pkl
│   │   ├── prec_lgb.pkl
│   │   ├── wind_xgb.pkl
│   │   └── rl/
│   │       └── ppo_agent_v2.zip
│   ├── Lahore/
│   │   └── [same files]
│   ├── Islamabad/
│   │   └── [same files]
│   ├── Peshawar/
│   │   └── [same files]
│   └── Quetta/
│       └── [same files]
```

## How to Get Your Models

### From Google Drive

1. Go to your Google Drive
2. Navigate to: `MyDrive/FYP_WeatherPrediction/models_city_v3/`
3. Download the entire `models_city_v3` folder
4. Extract it to `ml_service/models/`

### From Colab Notebook

If you just trained the models in your notebook:

```python
# In your Predict_v3_Complete_Pipeline.ipynb notebook
import shutil
from google.colab import files

# Zip the models folder
shutil.make_archive('/content/models_city_v3', 'zip', '/content/drive/MyDrive/FYP_WeatherPrediction/models_city_v3')

# Download
files.download('/content/models_city_v3.zip')
```

Then extract the zip file to `ml_service/models/`

## Model Files Explained

| File | Description | Algorithm |
|------|-------------|-----------|
| `temp_max_lgb.pkl` | Max temperature prediction model | LightGBM |
| `temp_min_lgb.pkl` | Min temperature prediction model | LightGBM |
| `prec_lgb.pkl` | Precipitation prediction model | LightGBM |
| `wind_xgb.pkl` | Wind speed prediction model | XGBoost |
| `rl/ppo_agent_v2.zip` | RL correction model | PPO (Stable Baselines3) |

## Verification

Once you've copied the models, restart the ML service:

```bash
# Stop the current service (Ctrl+C)
# Then restart
cd ml_service
start.bat  # Windows
./start.sh   # Mac/Linux
```

You should see console messages like:
```
Loaded trained model for Karachi/temperature_max
Loaded PPO RL model for Karachi
```

## Testing

Make a prediction through the dashboard. The model status indicator will show:
- ✅ **Trained Models Active** (green) - Real models are being used
- ⚠️ **Fallback Mode** (amber) - Using statistical fallback (models not found)

## Fallback Mode

If models are not available, the service uses intelligent fallback predictions based on:
- Seasonal patterns from historical data
- Recent trends (30-day moving average)
- Heuristic RL corrections

These fallbacks are reasonable but **not as accurate** as your trained models.

## Troubleshooting

### "Failed to load model for Karachi/temperature_max"
- Check that the .pkl file exists
- Verify Python package versions match (lightgbm, xgboost)

### "Failed to load RL model"
- Check that ppo_agent_v2.zip exists in the rl/ subdirectory
- Verify stable-baselines3 is installed

### Models load but predictions seem wrong
- Check that the data file `pak_weather_engineered_v3.csv` is present
- Verify the models were trained with the same feature set (108 features)

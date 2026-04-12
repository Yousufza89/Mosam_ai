# Final Integration Test & Verification

## 🎯 GOAL: Get ~24°C prediction for Karachi Jan 1 (like your Colab notebook)

---

## Step 1: Stop Everything

1. Stop the ML service (Ctrl+C in terminal)
2. Stop Next.js dev server (Ctrl+C in other terminal)

---

## Step 2: Install Missing Dependencies

```bash
cd ml_service
pip install lightgbm==4.3.0 xgboost==2.0.3 stable-baselines3==2.2.1 torch==2.1.2
```

**Verify installation:**
```bash
python -c "import lightgbm; import xgboost; import stable_baselines3; print('✓ All ML libraries installed')"
```

---

## Step 3: Start ML Service with Debug Output

```bash
cd ml_service
python app.py
```

**You should see:**
```
✓ Data loaded successfully
  Path: C:\...\data\pak_weather_engineered_v3.csv
  Shape: (12785, 108)
  Date range: 2018-12-31 to 2025-12-31

============================================================
VERIFYING ALL MODELS
============================================================

Karachi:
  ✓ temperature_max      loaded (108 features)
  ✓ temperature_min      loaded (108 features)
  ✓ precipitation        loaded (108 features)
  ✓ wind_speed           loaded (108 features)
  ✓ RL Model (PPO)       loaded

Lahore:
  ✓ temperature_max      loaded (108 features)
  ...

SUMMARY: 25/25 baseline models loaded
         5/5 RL models loaded
✓ Models cached and ready for predictions
============================================================
```

If you see ❌ instead of ✓, the models aren't being found. Check that `models/models_city_v3/` exists.

---

## Step 4: Test the ML Service Directly

Open browser: http://localhost:8000/test

**Expected result:**
```json
{
  "test_case": {
    "city": "Karachi",
    "feature": "temperature_max",
    "date": "2026-01-01"
  },
  "prediction": {
    "baseline": 24.33,      ← Should be ~24 (not 33!)
    "rl_correction": 0.04,
    "final": 24.37
  },
  "models_used": {
    "baseline": "trained LightGBM",  ← Not "statistical fallback"
    "rl": "trained PPO"
  }
}
```

If you see `baseline: 33.3` and `models_used.baseline: "statistical fallback"`, the models aren't loading.

---

## Step 5: Start Next.js

```bash
# In new terminal
npm run dev
```

---

## Step 6: Make Prediction on Dashboard

1. Go to http://localhost:3000/user/dashboard
2. Login
3. Select: **Karachi**, **Max Temp**, **2026-01-01**
4. Click "Generate Prediction"
5. **Watch the ML service console** - you should see:
   ```
   [Predict] Karachi/temperature_max/2026-01-01
     Model cache key: Karachi_temperature_max
     Model found: True
     Model type: LGBMRegressor
     Baseline prediction: 24.33 (using_real=True)
   ```

6. **Check browser console** (F12 → Console) for:
   ```
   ML Prediction Result: {
     baseline: 24.33,
     final: 24.37,
     usingTrainedModels: true
   }
   ```

---

## Step 7: Verify Correct Prediction

**Dashboard should show:**
- **Prediction:** ~24.3°C (NOT 33.3°C!)
- **Model Badge:** "LightGBM (trained)" or "AI-v3.0 (trained)"
- **Status:** Green "Trained Models Active" badge

---

## Troubleshooting

### If ML Service Shows "0 models loaded":

**Check model path:**
```bash
cd ml_service
python -c "
import os
MODELS_DIR = os.path.join('..', 'models', 'models_city_v3')
print('Looking for models at:', os.path.abspath(MODELS_DIR))
print('Exists:', os.path.exists(MODELS_DIR))
"
```

**Should print:**
```
Looking for models at: C:\Users\Swenta\Desktop\mosam_ai\Mosam_ai\models\models_city_v3
Exists: True
```

### If LightGBM Not Found:

```bash
pip uninstall lightgbm
pip install lightgbm==4.3.0
```

### If Predictions Still Show 33.3°C:

1. Check ML service console output - does it say "Model found: True"?
2. If "Model found: False", models aren't being loaded
3. If "Model found: True" but prediction is wrong, the model files might be corrupted

### Quick Diagnostic:

Add this to your notebook to compare:

```python
# In Predict_v3_Quick_Predictions_Only.ipynb
city = "Karachi"
feature = "temperature_max"
date = "2026-01-01"

features = create_features_for_prediction(df, city, datetime.strptime(date, '%Y-%m-%d'), feature)
baseline_pred, _ = load_model_and_predict(city, feature, features)
print(f"Notebook prediction: {baseline_pred:.2f}")
# Should match what you see in the dashboard
```

---

## Files Modified

| File | Changes |
|------|---------|
| `ml_service/app.py` | Added model caching, startup verification, debug output |
| `app/api/predict/route.ts` | Better error handling, model status passing |
| `app/user/dashboard/page.tsx` | Model status indicator |

---

## Expected vs Actual

| | Your Notebook | Before Fix | After Fix |
|---|---|---|---|
| **Karachi Jan 1 Max Temp** | 24.33°C | 33.3°C ❌ | 24.33°C ✓ |
| **Model Used** | LightGBM | Statistical fallback | LightGBM |

---

## Success Criteria

✅ **PASS** if:
- Dashboard shows ~24.3°C for Karachi Jan 1
- ML service console shows "Model found: True"
- Browser console shows "usingTrainedModels: true"
- Green "Trained Models Active" badge appears

❌ **FAIL** if:
- Dashboard shows ~33°C
- ML service shows "Model found: False"
- Orange "Fallback Mode" badge appears

---

## Need Help?

If it's still not working, send me:
1. Screenshot of ML service startup output
2. Screenshot of browser console after prediction
3. Screenshot of dashboard showing the prediction result

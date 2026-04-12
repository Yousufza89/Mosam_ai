# Mosam AI - Weather Prediction Platform

An AI-powered weather prediction platform for Pakistan, built with Next.js and Machine Learning.

## Features

- **AI-Powered Predictions**: Uses LightGBM baseline models with PPO reinforcement learning corrections
- **108 Engineered Features**: Comprehensive feature engineering from historical weather data
- **5 Major Cities**: Karachi, Lahore, Islamabad, Peshawar, Quetta
- **Real-time Processing**: Step-by-step ML pipeline visualization
- **Professional Dashboard**: Modern UI with glassmorphism design

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Next.js API     │────▶│  Python ML      │
│   (Frontend)    │     │  (/api/predict)  │     │  FastAPI Service│
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                          │
                               ▼                          ▼
                        ┌─────────────┐           ┌──────────────┐
                        │  Prisma DB  │           │  Data File   │
                        │  (Predictions)│          │  (CSV)       │
                        └─────────────┘           └──────────────┘
```

## Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
npm install
# or
pnpm install
```

**ML Service:**
```bash
cd ml_service
pip install -r requirements.txt
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```env
DATABASE_URL="your_database_url"
NEXTAUTH_SECRET="your_secret"
NEXTAUTH_URL="http://localhost:3000"
ML_SERVICE_URL="http://localhost:8000"
```

### 3. Start the ML Service

**Windows:**
```bash
cd ml_service
start.bat
```

**Mac/Linux:**
```bash
cd ml_service
chmod +x start.sh
./start.sh
```

The ML service will start on http://localhost:8000

### 4. Start the Next.js App

```bash
npm run dev
```

Open http://localhost:3000

## ML Prediction Pipeline

When you make a prediction, the system runs these steps:

1. **Data Loading** - Load historical weather dataset (12,785 records)
2. **Date Parsing** - Validate and parse the prediction date
3. **Feature Engineering** - Extract 108 engineered features
4. **Baseline Model** - Run LightGBM prediction
5. **RL Correction** - Apply PPO reinforcement learning correction
6. **Confidence Calc** - Calculate prediction confidence

## Deployment

### Deploy ML Service (Render/Railway/Heroku)

1. Push code to GitHub
2. Create new Web Service on Render
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python app.py`
5. Add environment variable: `PORT=8000`

### Deploy Next.js (Vercel)

```bash
vercel --prod
```

Update `ML_SERVICE_URL` environment variable in Vercel dashboard to point to your deployed ML service.

## Project Structure

```
mosam_ai/
├── app/                    # Next.js app directory
│   ├── api/predict/        # Prediction API route
│   └── user/dashboard/     # Dashboard page
├── ml_service/             # Python FastAPI service
│   ├── app.py             # Main FastAPI app
│   └── requirements.txt   # Python dependencies
├── data/                   # Data files
│   └── pak_weather_engineered_v3.csv
└── models/                 # Jupyter notebooks
    └── Predict_v3_*.ipynb
```

## API Endpoints

### ML Service

- `GET /` - Service info
- `GET /health` - Health check
- `POST /predict` - Make prediction
  ```json
  {
    "city": "Karachi",
    "feature": "temperature_max",
    "date": "2026-04-01"
  }
  ```

### Next.js API

- `POST /api/predict` - Proxy to ML service with auth
- `POST /api/predict/save` - Save prediction to history

## Data Features

The model uses 108 engineered features:
- **Time Features**: year, month, day, day_of_year, week
- **Cyclical Features**: sin/cos transformations for seasonality
- **Lag Features**: 1, 2, 3, 5, 7, 14, 21, 30-day lags
- **Rolling Stats**: 3, 7, 14, 30-day means, std, min, max
- **Trend Features**: Differences, acceleration, volatility
- **Seasonal Features**: Season encoding, monsoon detection
- **City Features**: Lat/lon, coastal flag

## Development

### Running Tests

```bash
npm test
```

### Database Migrations

```bash
npx prisma migrate dev
```

### ML Service Development

The ML service includes fallback prediction logic if trained models are not available. For production use, train and save models using the Jupyter notebooks in `models/`.

## License

MIT License - 2026 Mosam AI


# Weather Risk Assessment API

FastAPI service for predicting MLN spread risk by combining CNN severity predictions with weather data using Random Forest.

## 🚀 Local Development

### Prerequisites
- Python 3.10+
- Model artifacts in `models/` folder:
  - `spread_risk_model.pkl`
  - `encoder_severity.pkl`
  - `encoder_district.pkl`
  - `encoder_risk.pkl`

### Setup

```bash
# Navigate to weather_risk_api folder
cd Model/weather_risk_api

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

The API will be available at: `http://localhost:8001`

## 📡 Endpoints

### 1. Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "supported_severities": ["Early", "HEALTHY", "Moderate", "Severe"],
  "supported_districts": ["Musanze", "Nyabihu"]
}
```

### 2. Root
```bash
GET /
```

### 3. Predict Spread Risk
```bash
POST /predict
Content-Type: application/json
```

**Request Body:**
```json
{
  "severity": "Moderate",
  "temperature_c": 28.5,
  "humidity_pct": 75.0,
  "rainfall_mm": 15.0,
  "district": "Musanze"
}
```

**Response:**
```json
{
  "risk_level": "High",
  "severity": "Moderate",
  "temperature_c": 28.5,
  "humidity_pct": 75.0,
  "rainfall_mm": 15.0,
  "district": "Musanze",
  "confidence": 0.92,
  "inference_time_ms": 12.5
}
```

## 🌐 Render Deployment

### Step 1: Push to GitHub

Make sure your changes are committed:
```bash
git add Model/weather_risk_api/
git commit -m "Add Weather Risk API deployment config"
git push origin main
```

### Step 2: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `pimanzi/IkigoriSmart`
4. Configure:
   - **Name:** `ikigori-weather-risk-api`
   - **Region:** Frankfurt (EU Central)
   - **Branch:** `main`
   - **Root Directory:** `Model/weather_risk_api`
   - **Runtime:** Python 3
   - **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free

### Step 3: Add Environment Variables

In Render dashboard, go to **Environment** tab and add:
```
PYTHON_VERSION=3.10.0
```

### Step 4: Upload Model Artifacts

⚠️ **CRITICAL:** The model pickle files are excluded from Git.

**Option A: Use Render Disk (Recommended)**
1. Go to your service → **"Disks"** tab
2. Create a disk: `/mnt/models`
3. Upload all `.pkl` files from `Model/weather_risk_api/models/`:
   - `spread_risk_model.pkl`
   - `encoder_severity.pkl`
   - `encoder_district.pkl`
   - `encoder_risk.pkl`
4. Update code to use `/mnt/models/` path

**Option B: Upload via Shell**
1. Deploy the service first (it will fail initially)
2. Go to **"Shell"** tab
3. Create directory: `mkdir -p models`
4. Upload all `.pkl` files using Render's file upload

### Step 5: Deploy

Click **"Create Web Service"** and wait for deployment (~3-5 minutes).

Your API will be live at: `https://ikigori-weather-risk-api.onrender.com`

### Step 6: Test Deployment

```bash
# Health check
curl https://ikigori-weather-risk-api.onrender.com/health

# Test prediction
curl -X POST https://ikigori-weather-risk-api.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "Moderate",
    "temperature_c": 28.5,
    "humidity_pct": 75.0,
    "rainfall_mm": 15.0,
    "district": "Musanze"
  }'
```

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8001` | Server port (auto-set by Render) |
| `PYTHON_VERSION` | `3.10.0` | Python runtime version |

## 📊 Model Details

- **Algorithm:** Random Forest Classifier
- **Features:** severity, temperature, humidity, rainfall, district
- **Classes:** Low, Medium, High risk
- **Training Data:** Rule-based synthetic data from CIMMYT (2021) thresholds

### Risk Logic

Based on agricultural research (CIMMYT, RAB, Prasanna 2021):

**High Risk Conditions:**
- Temperature: 25-30°C (optimal for thrips/beetles)
- Humidity: >80% (promotes insect breeding)
- Rainfall: <20mm (drought stress weakens plants)
- Severity: Moderate or Severe

**Medium Risk:**
- Moderate temperature (22-25°C or 30-32°C)
- Humidity 60-80%
- Rainfall 20-50mm
- Severity: Early or Moderate

**Low Risk:**
- Temperature outside optimal range
- Humidity <60%
- Rainfall >50mm
- Severity: Healthy

## 🐛 Troubleshooting

### Model artifacts not found
- Verify all `.pkl` files are uploaded to `models/` directory
- Check Render logs for file path errors
- Ensure files are not corrupted during upload

### Prediction errors
- Check input validation - all fields are required
- Verify severity matches exact strings: "Early", "HEALTHY", "Moderate", "Severe"
- Verify district is "Musanze" or "Nyabihu"

### Cold starts on Free tier
- Free tier services sleep after 15 min inactivity
- First request takes ~10-20 seconds to wake up
- Subsequent requests are fast (<50ms)

## 📝 API Documentation

Once deployed, visit:
- **Swagger UI:** `https://your-api.onrender.com/docs`
- **ReDoc:** `https://your-api.onrender.com/redoc`

## 🔒 Production Checklist

- [ ] Upload all model artifacts
- [ ] Test all endpoints after deployment
- [ ] Set up monitoring/alerts
- [ ] Configure logging
- [ ] Add rate limiting (if needed)
- [ ] Enable HTTPS (automatic on Render)

## 🔗 Integration with Mobile App

After deployment, update `mobileapp/.env`:
```env
EXPO_PUBLIC_WEATHER_RISK_API_URL=https://ikigori-weather-risk-api.onrender.com
```

The mobile app will call this API after:
1. MLN severity is detected from image
2. Weather data is fetched from Open-Meteo
3. Combined prediction shows final spread risk

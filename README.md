# IkigoriSmart

AI-powered Maize Lethal Necrosis (MLN) detection and disease spread risk platform for smallholder farmers in Rwanda.

---

## Description

IkigoriSmart helps Rwandan farmers detect and manage Maize Lethal Necrosis (MLN) a disease that can cause up to 100% crop loss in a single season. Farmers photograph a maize leaf, and the system returns a severity classification (Healthy, Early, Moderate, Severe) from a CNN model, combines it with real-time weather data (temperature, humidity, rainfall) to predict disease spread risk, and then surfaces targeted IPM recommendations from a Supabase-managed knowledge base. All screens are available in English and Kinyarwanda. Admins can post district-level alerts that appear in the mobile app and are tracked per-user as read or unread.

---

## Features

- MLN severity classification via a PyTorch CNN trained on labelled maize leaf images
- Weather-based spread risk prediction via a scikit-learn model consuming Open-Meteo API data
- IPM recommendations filtered by severity and risk level, grouped by action type (Immediate, Monitor, Preventive)
- Scan history — predictions saved to Supabase with image, severity, weather, and district
- District-level alerts with per-user read tracking
- Tutorial library with save, progress tracking, and note-taking
- Bilingual interface (English and Kinyarwanda) using i18next
- Light and dark theme support
- Admin web dashboard for managing alerts, tutorials, IPM content, and viewing scan analytics
- Email confirmation landing page hosted separately on Vercel

---

## Demo and Links

| Resource | Link |
|---|---|
| Analysis and research document | [https://docs.google.com/document/d/1RJscQT1HnRixudaA6xrOGvlUb36tS5J8DScshhCOMiY/edit?usp=sharing] |
| Farmer Mobile App APK| [https://drive.google.com/drive/folders/1hhzdr_GrFJjTpGtU7lrsMSeDXvfZx-vO?usp=sharing] |
| Admin web app | [https://ikigorismart-admin.netlify.app/] |
| MLN Severity API Docs | [https://ikigorismart.onrender.com/docs] |
| MLN Spread Risk API Docs | [https://ikigori-weather-risk-api.onrender.com/docs] |
| Gatekeeper Model Docs | [https://ikigorismart-gatekeeper-api.onrender.com/docs] |
| Email confirmation page | [https://ikigori-signup-confirm.netlify.app/] |
| GitHub repository | https://github.com/pimanzi/IkigoriSmart.git |

---

## Project Structure

```
IkigoriSmart/
├── Model/
│   ├── notebooks/          # Jupyter notebooks for training and analysis
│   ├── mln_api/            # FastAPI service — MLN severity inference (PyTorch CNN)
│   ├── weather_risk_api/   # FastAPI service — spread risk inference (scikit-learn)
│   ├── models/production/  # Saved model weights and encoders
│   └── environment.yml     # Conda environment for notebooks
├── mobileapp/              # React Native (Expo) farmer app
├── webapp/                 # React (Vite + Tailwind) admin dashboard
└── emailconfirm/           # React (Vite) email confirmation landing page
```

---

## Environment Setup and Installation

### Prerequisites

- Python 3.9 (for notebooks and model training)
- Python 3.11+ (for the two API services)
- Node.js 18+
- Conda (Anaconda or Miniconda)
- Expo CLI — `npm install -g expo-cli`
- A Supabase project with the required tables (alerts, alert_reads, predictions, ipm_recommendations, profiles, tutorials, saved_tutorials, tutorial_notes)

---

### 1. Clone the repository

```bash
git clone https://github.com/pimanzi/IkigoriSmart.git
cd IkigoriSmart
```

---

### 2. MLN Severity API (PyTorch CNN)

Located in `Model/mln_api/`. Serves the CNN model that classifies maize leaf severity.

```bash
cd Model/mln_api

python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

pip install -r requirements.txt
```

**Key dependencies:**

| Package | Version | Purpose |
|---|---|---|
| fastapi | 0.109.0 | REST API framework |
| uvicorn | 0.27.0 | ASGI server |
| torch | 2.2.0 | CNN inference |
| torchvision | 0.17.0 | Image transforms |
| pillow | 10.2.0 | Image loading |
| pydantic | 2.6.0 | Request/response validation |
| numpy | 1.26.4 | Array operations |

The model weights are downloaded automatically from Hugging Face on first startup.

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API available at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

---

### 3. Weather Risk API (scikit-learn)

Located in `Model/weather_risk_api/`. Predicts spread risk level (Low, Medium, High) from weather and severity inputs.

```bash
cd Model/weather_risk_api

python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
```

**Key dependencies:**

| Package | Version | Purpose |
|---|---|---|
| fastapi | 0.104.1 | REST API framework |
| uvicorn | 0.24.0 | ASGI server |
| scikit-learn | 1.3.2 | Risk model inference |
| joblib | 1.3.2 | Model loading |
| pydantic | 2.11.0 | Validation |
| numpy | 1.26.2 | Array operations |

The model is bundled in `weather_risk_api/models/`. No download needed.

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

---

### 4. ML Notebooks (optional — for training and analysis)

Located in `Model/notebooks/`. Use the Conda environment to run training notebooks.

```bash
cd Model

conda env create -f environment.yml
conda activate ikigori_mln

jupyter notebook notebooks/
```

Notebooks included:

- `phase_2_cnn_training_complete.ipynb` — full CNN training pipeline
- `production_severity_model.ipynb` — production model export
- `weather-risk_modal.ipynb` — spread risk model training
- `mln_visualization.ipynb` — dataset and result visualisation

---

### 5. Mobile App (React Native / Expo)

Located in `mobileapp/`. Farmer-facing app targeting Android (iOS compatible).

Create a `.env` file in the `mobileapp/` directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_MLN_API_URL=http://localhost:8000
EXPO_PUBLIC_WEATHER_RISK_API_URL=http://localhost:8001
```

```bash
cd mobileapp
npm install
npm start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

**Key libraries:**

| Library | Purpose |
|---|---|
| expo ~54 | Build and runtime toolchain |
| react-native 0.81 | Cross-platform UI |
| @supabase/supabase-js ^2 | Database and auth |
| @tanstack/react-query ^5 | Server state and caching |
| @react-navigation/native ^7 | Navigation |
| i18next + react-i18next | Bilingual support (EN / RW) |
| expo-image-picker | Leaf image capture |
| @react-native-voice/voice | Voice input |
| react-native-toast-message | In-app notifications |

---

### 6. Admin Web App (React / Vite)

Located in `webapp/`. Dashboard for admins to manage alerts, tutorials, IPM content, and view scan analytics.

Create a `.env` file in the `webapp/` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
cd webapp
npm install
npm run dev
```

Available at `http://localhost:5173`.

**Key libraries:**

| Library | Purpose |
|---|---|
| react ^19 + react-dom | UI framework |
| react-router-dom ^7 | Client-side routing |
| @supabase/supabase-js ^2 | Database and auth |
| @tanstack/react-query ^5 | Server state |
| tailwindcss ^4 | Utility-first styling |
| radix-ui | Accessible component primitives |
| recharts | Analytics charts |
| react-hook-form | Form handling |
| i18next + react-i18next | Bilingual support |
| lucide-react | Icons |
| sonner | Toast notifications |

---

### 7. Email Confirmation Page (React / Vite)

Located in `emailconfirm/`. A standalone page that Supabase redirects to after a user confirms their email address. Deploy separately on Vercel or any static host.

```bash
cd emailconfirm
npm install
npm run dev
```

Available at `http://localhost:5174`.

Set the email confirmation redirect URL in your Supabase project dashboard to point to the deployed URL of this page.

**Dependencies:** React 19, Vite 7, TypeScript.

---

## Testing

All tests live in a `tests/` folder inside each sub-project. The test suite covers three layers: unit, integration, and end-to-end.

---

### Tools

| Tool | Scope |
|---|---|
| Jest | Unit and integration tests — mobile and web |
| React Native Testing Library | React Native UI component tests |
| Maestro | End-to-end mobile flows on a real device or emulator |
| Playwright | End-to-end admin web app flows in a real browser |

---

### Running the tests

**Mobile (unit + integration):**

```bash
cd mobileapp
npm install
npm test               # all unit + integration tests
npm run test:unit      # unit tests only
npm run test:integration  # integration tests only
```

**Mobile (E2E with Maestro):**

```bash
# Install Maestro CLI first
brew install maestro   # macOS

# Run with your app open on device or emulator
maestro test mobileapp/tests/e2e/diseaseScan.yaml
maestro test mobileapp/tests/e2e/spreadRiskFlow.yaml
```

**Web (unit + integration):**

```bash
cd webapp
npm install
npm test               # all unit + integration tests
npm run test:unit      # unit tests only
npm run test:integration  # integration tests only
```

**Web (E2E with Playwright):**

```bash
cd webapp
npx playwright install  # install browsers on first run

# Set credentials in environment
export TEST_ADMIN_EMAIL=your_admin_email
export TEST_ADMIN_PASSWORD=your_admin_password

npm run test:e2e
```

---

### Test inventory

#### 4.2.5 Unit tests

| ID | Platform | File | What is tested |
|---|---|---|---|
| UT-M-01 | Mobile | `tests/unit/imageValidation.test.ts` | `isValidImageUri` — accepts valid extensions and `content://` URIs; rejects PDF, MP4, GIF, TXT |
| UT-M-02 | Mobile | `tests/unit/weatherValidation.test.ts` | `isValidTemperature`, `isValidHumidity`, `isValidRainfall` — boundary values, out-of-range inputs, empty and non-numeric strings |
| UT-W-01 | Web | `tests/unit/dashboardHelpers.test.ts` | `computeSeverityBreakdown`, `computeRiskBreakdown`, `computePredictionsOverTime` — counts from fixture data, date grouping, cutoff window, ascending sort |
| UT-W-02 | Web | `tests/unit/authService.test.ts` | `loginUser` — valid credentials return user + profile; unconfirmed email, wrong credentials, and missing profile each throw a correctly mapped error message |

**UT-M-01 — Image URI Validation**

`isValidImageUri` is the guard function called before any image is accepted into the scan flow. The tests cover every supported extension (`.jpg`, `.jpeg`, `.png`, `.bmp`, `.webp`), case-insensitivity, Android `content://` URIs which carry no extension, and rejection of non-image types (`.pdf`, `.mp4`, `.gif`, `.txt`).

**UT-M-02 — Weather Input Boundary Validation**

The three validator functions enforce the physical ranges the ML spread risk model was trained on: temperature 10–35 °C, humidity 0–100 %, rainfall 0–500 mm. Tests verify exact boundary values pass, values one unit outside each boundary fail, and empty or non-numeric strings are rejected before `parseFloat` is called.

**UT-W-01 — Dashboard Aggregation Helpers**

The dashboard service builds KPI data from a full Supabase scan. The three pure helper functions extracted into `src/utils/dashboardHelpers.ts` are tested against a controlled five-prediction fixture. Tests confirm per-severity and per-risk counts are correct, predictions outside the 30-day window are excluded from the time series, and the time-series array is returned in ascending date order.

**UT-W-02 — Auth Service Login**

`loginUser` wraps `supabase.auth.signInWithPassword` and maps low-level Supabase error strings to user-facing messages. Tests mock the Supabase client and cover the happy path (session + profile returned), unconfirmed email, invalid credentials, and the edge case where auth succeeds but the profile row is missing.

---

#### 4.2.6 Integration tests

| ID | Platform | File | What is tested |
|---|---|---|---|
| IT-M-01 | Mobile | `tests/integration/spreadRiskService.test.ts` | `predictSpreadRisk` — correct POST payload, successful response parsing, 503 maps to `apiUnavailable`, other non-ok responses map to `predictionFailed` |
| IT-M-02 | Mobile | `tests/integration/predictionService.test.ts` | `savePrediction` — returned ID on success, correct payload passed to Supabase insert, `PredictionError` thrown on Supabase error |
| IT-W-01 | Web | `tests/integration/ipmService.test.ts` | `fetchIPMRecommendations` — unfiltered returns all rows, severity filter calls `.eq('severity', value)`, combined filters each call `.eq`, Supabase error propagates as thrown |
| IT-W-02 | Web | `tests/integration/dashboardService.test.ts` | `fetchDashboardStats` — total prediction count, Farmer-only user count, severity breakdown, risk breakdown; all verified against a controlled six-row Supabase mock |

**IT-M-01 — Spread Risk Service**

`predictSpreadRisk` is the only mobile function that calls the external Weather Risk API. The tests mock `global.fetch` to verify the request URL, HTTP method, and serialised body are all correct, and that the parsed `SpreadRiskResponse` matches the mocked JSON. Two failure cases are covered: 503 (service unavailable) must throw a `SpreadRiskError` with the `apiUnavailable` i18n key, and any other non-ok status must throw with the `predictionFailed` key.

**IT-M-02 — Prediction Save Service**

`savePrediction` inserts a prediction record into Supabase and returns the new row ID. Tests mock the full Supabase fluent chain (`from → insert → select → single`) using a helper factory, verify the correct table and payload are used, and confirm that a Supabase error is wrapped in a `PredictionError` with the original message preserved.

**IT-W-01 — IPM Service Filters**

`fetchIPMRecommendations` accepts optional filters and builds a Supabase query chain accordingly. The tests mock the chain and assert that calling the function with `{ severity: 'Severe' }` invokes `.eq('severity', 'Severe')`, and that combining `severity` with `risk_level` produces two `.eq` calls. The no-filter path confirms all rows are returned and a Supabase error is re-thrown.

**IT-W-02 — Dashboard Service**

`fetchDashboardStats` makes multiple Supabase calls and aggregates the results. The tests mock `supabase.from` to return controlled fixture data for the predictions, profiles, feedback, and IPM tables, then assert that the returned `DashboardStats` object contains correct total counts and severity/risk breakdowns.

---

#### 4.2.7 End-to-end tests

| ID | Platform | File | What is tested |
|---|---|---|---|
| E2E-M-01 | Mobile | `tests/e2e/diseaseScan.yaml` | Full scan flow: launch → Scan tab → gallery pick → Predict button → loading → DiagnosisScreen with severity label and confidence |
| E2E-M-02 | Mobile | `tests/e2e/spreadRiskFlow.yaml` | Full spread risk flow: from diagnosis → district select → weather auto-fill → Preview → Run Prediction → SpreadRisk screen with risk level and IPM card |
| E2E-W-01 | Web | `tests/e2e/adminLogin.spec.ts` | Valid admin credentials redirect to dashboard with non-zero KPI cards; wrong credentials show error alert and stay on login page |
| E2E-W-02 | Web | `tests/e2e/ipmPage.spec.ts` | IPM page loads recommendation cards; severity filter reduces the visible set and each remaining card contains the selected severity label |

**E2E-M-01 — Disease Scan Flow**

The test launches the app, navigates to the Scan tab, picks the first image from the gallery, taps Predict, and waits up to 10 seconds for the DiagnosisScreen to appear. It asserts that both the severity label element and the confidence element are visible and that the loading indicator has disappeared, confirming the full CNN API round-trip completed successfully.

**E2E-M-02 — Spread Risk Flow**

Continuing from a completed disease scan, the test taps "Predict Spread Risk", selects Musanze as the district, waits for weather data to load from the Open-Meteo API, proceeds to the WeatherPreviewScreen, runs the spread risk prediction, and asserts that both a risk-level element and at least one IPM recommendation card are visible on the final screen.

**E2E-W-01 — Admin Login and Dashboard**

The test navigates to `/login`, submits valid admin credentials, waits for a redirect to `/dashboard`, and asserts that all three primary KPI cards are visible with a value greater than zero. A second test submits wrong credentials and asserts that an error alert is shown and the URL remains on `/login`.

**E2E-W-02 — IPM Page Filter**

After logging in, the test navigates to `/ipm`, waits for recommendation cards to load, records the total count, selects "Severe" from the severity filter, and then asserts that the remaining cards are fewer than or equal to the original count and that every visible card contains the text "Severe".

---

## Contributors

**Placide Imanzi Kabisa** — design, engineering, and product
[github.com/pimanzi](https://github.com/pimanzi)

---

## License

MIT License. See [LICENSE](LICENSE) for details.


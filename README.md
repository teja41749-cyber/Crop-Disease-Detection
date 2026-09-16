# 🌱 Crop Disease Detection System

An AI-powered system that identifies crop diseases from leaf images and suggests remedies. Built with a **FastAPI** backend (MobileNetV2 model, 59 disease classes) and a lightweight **JavaScript (Vite)** frontend with a farmer-friendly, mobile-responsive UI supporting **English and Marathi**.

---

## 📌 How It Works

```
Leaf Image
   ↓
Frontend (upload / camera capture)
   ↓
FastAPI Backend (/predict)
   ↓
Image Preprocessing
   ↓
MobileNetV2 Model
   ↓
Prediction (1 of 59 classes) + Confidence + Remedy
```

---

## 🗂️ Project Structure

```
Crop-Disease-Detection/
├── plant_disease_project-backend/
│   ├── app.py                  # FastAPI server — the actual running backend
│   ├── plant_disease_model.keras  # Trained model (required to run)
│   ├── class_names.json        # List of the 59 disease classes
│   ├── remedies.json           # Remedy text per disease class
│   ├── requirements.txt        # Python dependencies
│   └── (debug scripts — not part of the running app, see note below)
│
└── plant_disease_project-frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js          # Proxies /predict → localhost:8000 in dev
    └── src/                    # UI code, translations, API calls
```

---

## ✅ Prerequisites

Install these before starting:

| Tool | Version | Check with |
|---|---|---|
| Python | 3.9 – 3.11 | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | comes with Node | `npm --version` |

---

## 🚀 Running the Project (Step by Step)

You need **two terminals open at the same time** — one for the backend, one for the frontend.

### 1. Clone the repository

```bash
git clone https://github.com/teja41749-cyber/Crop-Disease-Detection.git
cd Crop-Disease-Detection
```

### 2. Start the Backend (Terminal 1)

```bash
cd plant_disease_project-backend

# Create and activate a virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app:app --reload --port 8000
```

✅ Backend is working if you open **http://localhost:8000** and see:
```json
{"status": "Plant Disease Detection API is running"}
```

**Leave this terminal running.**

### 3. Start the Frontend (Terminal 2 — new terminal)

```bash
cd plant_disease_project-frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

✅ Open the URL it prints (usually **http://localhost:5173**) in your browser.

The frontend is already configured (`vite.config.js`) to forward prediction requests to the backend on port 8000 automatically — no extra setup needed as long as both servers are running.

### 4. Use the App

1. Open http://localhost:5173
2. Upload or capture a leaf image
3. The predicted disease, confidence %, and remedy will be displayed
4. Switch language (English / Marathi) from the UI

---

## ⚠️ Important Points Whoever Presents This Should Know

**1. There is an unresolved preprocessing bug that may affect prediction accuracy.**
`app.py` currently sends raw pixel values (0–255) straight into the model with no normalization. MobileNetV2-based models are normally trained expecting either `[0,1]` or `[-1,1]` scaled input. If the model was trained with normalized images, live predictions right now could be **less accurate than the model is actually capable of**. This was under active investigation (see `final_diagnosis.py`, `test_preprocessing.py`, `test_patterns.py` in the backend folder) but was **not confirmed fixed** as of this writing. If a professor/judge asks about accuracy or gets an odd prediction, this is the honest, technically correct answer: *"we identified a possible preprocessing mismatch during evaluation and are validating it against the training pipeline."*

**2. The debug/test scripts in the backend folder are not part of the running app.**
`check_weights.py`, `inspect_model.py`, `final_diagnosis.py`, `test_augmentation.py`, `test_patterns.py`, `test_preprocessing.py` were investigation tools used to diagnose the issue above. They're safe to ignore when just running the app — only `app.py` needs to run.

**3. Low-confidence predictions are handled gracefully.**
If the model's confidence is below 60%, the API returns a warning asking for a clearer photo instead of a possibly-wrong diagnosis. This is intentional, not a bug.

**4. CORS is currently wide open (`allow_origins=["*"]`).**
Fine for a demo/local run — flag it if anyone asks about production security, since it should be restricted before real deployment.

**5. The model file (`plant_disease_model.keras`, ~24 MB) is included directly in the repo.**
No separate download step needed — it's already there after cloning.

---

## 🧯 Troubleshooting

| Problem | Likely Fix |
|---|---|
| `ModuleNotFoundError` when running backend | Make sure the virtual environment is activated before `pip install` |
| Frontend loads but predictions fail | Confirm the backend terminal is still running on port 8000 |
| `npm install` fails | Confirm Node.js 18+ is installed (`node --version`) |
| Port 8000 or 5173 already in use | Close other running servers, or change the port in the run command / `vite.config.js` |

---

## 🛠️ Tech Stack

- **Backend:** FastAPI, TensorFlow (Keras), Pillow, NumPy
- **Model:** MobileNetV2 (transfer learning), 59-class classifier
- **Frontend:** Vanilla JS + Vite, i18n (English/Marathi)

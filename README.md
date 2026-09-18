# 🌱 Crop Disease Detection System

An AI-powered crop disease detection system that identifies crop diseases from leaf images, tracks scan history, and provides remedy information — built for farmers with a **farmer-friendly, mobile-responsive interface** currently supporting **English and Marathi**.

---

## 📌 Project Overview

The system allows a user to upload or capture a crop leaf image. The image is first checked by a **leaf validation model** to confirm it is actually a plant leaf, then passed to a trained **MobileNetV2** disease model that predicts one of **59 disease classes**. Every scan is logged to a local database, enabling weather-based risk alerts, a farmer feedback loop, and dashboard analytics.

### System Flow

```text
                 Farmer Uploads Image
                         │
                         ▼
                ┌──────────────────┐
                │  Leaf Validator  │
                │    MobileNetV2   │
                └────────┬─────────┘
                         │
                ┌────────┴────────┐
                │                 │
             NOT LEAF             LEAF
                │                 │
                ▼                 ▼
             Reject        Disease Detection
                                  │
                                  ▼
                         59 Disease Classes
                                  │
                                  ▼
                         Confidence Check
                           ≥ 60% / < 60%
                                  │
                         ┌────────┴────────┐
                         ▼                 ▼
                      Disease           Uncertain
                         │                 │
                         ▼                 ▼
                       Remedy      Logged for review
                         │                 │
                         └────────┬────────┘
                                  ▼
                         Saved to Database
                     (scan history, feedback,
                      dashboard, hotspot data)
```

---

## ✨ Features

- 📷 Upload or capture a crop leaf image from a mobile-responsive web UI
- 🍃 **Leaf/Not-Leaf validation** — rejects non-leaf images (logos, objects, people, etc.) before they ever reach the disease model
- 🔬 Disease classification across **59 classes** using MobileNetV2 transfer learning
- 📊 Confidence-based response: `success`, `uncertain`, or `invalid_image`
- 💊 Remedy information for the detected disease
- 🗄️ **Persistent scan history** (SQLite) — every scan is logged with disease, confidence, and optional geolocation
- 🌦️ **Weather-based disease risk** — pulls live weather data and estimates outbreak risk (Low/Moderate/High)
- 🗣️ **Farmer feedback loop** — farmers can confirm or correct a prediction, feeding back into the system
- 📈 **Dashboard statistics** — total scans, pending confirmations, disease frequency, and district-level breakdown
- 🌐 Bilingual interface — **English** and **Marathi**

---

## 🧠 Why Leaf Validation Was Added

The original disease model is a **closed-set classifier** — it always picks the closest match among its 59 disease classes, even for images that aren't crop leaves at all.

**Example of the problem:**

```text
IARE Logo → Disease Model → Mango Anthracnose — 76%   ❌ false positive
```

A separate binary validator now checks *"is this even a leaf?"* before the image ever reaches the disease model.

**Same image, after the fix:**

```text
IARE Logo → Leaf Validator → NOT_LEAF (98.52%) → Rejected   ✅
```

### Validator training details

| Item | Value |
|---|---|
| Model | MobileNetV2 (transfer learning, ImageNet) |
| Input size | 128 × 128 |
| Batch size | 32 |
| Optimizer | Adam (lr = 0.0001) |
| Loss | Binary Crossentropy |
| Augmentation | Random flip, rotation, zoom, contrast |
| Class weighting | leaf = 0.531, not_leaf = 8.518 (dataset imbalance correction) |

**Test performance**

| Class | Precision | Recall | F1 |
|---|---:|---:|---:|
| Leaf | 1.0000 | 0.9973 | 0.9987 |
| Not-Leaf | 0.9592 | 1.0000 | 0.9792 |
| **Overall Accuracy** | | **99.75%** | |

Out of 47 not-leaf test images, **0 were misclassified as leaf**.

---

## 🗄️ Scan Database, Weather Risk & Feedback Loop

Every prediction is now persisted to a local **SQLite** database (`agrigaurd.db`) via `database.py`, unlocking several features beyond a one-shot classifier:

- **Scan history** — each scan stores disease, confidence, latitude/longitude, district, and a timestamp
- **Farmer feedback** — a farmer can later confirm whether a prediction was correct, or supply the actual disease if it wasn't, via `POST /feedback`
- **Dashboard stats** — total scans, scans awaiting confirmation, disease frequency counts, and district-wise counts, via `GET /dashboard/stats`
- **Geotagged scans** — `GET /scans` returns all scans that have location data, laying the groundwork for a disease hotspot map
- **Weather-based risk** — `GET /weather-risk` calls the Open-Meteo API for live temperature, humidity, and rainfall at a given location, and classifies outbreak risk as **Low / Moderate / High** based on humidity and rainfall thresholds

---

## 🏗️ Project Structure

```text
Crop-Disease-Detection/
│
├── plant_disease_project-backend/
│   ├── app.py                         ← FastAPI app (leaf validation + disease prediction + DB + weather)
│   ├── database.py                    ← NEW — SQLite persistence layer (scans, feedback, dashboard stats)
│   ├── agrigaurd.db                   ← NEW — SQLite database file
│   ├── leaf_validator.keras           ← Binary leaf/not-leaf classifier
│   ├── leaf_validator_classes.json
│   ├── plant_disease_model.keras      ← 59-class disease model
│   ├── class_names.json
│   ├── remedies.json
│   └── requirements.txt
│
├── plant_disease_project-frontend/
│   └── src/
│       ├── main.js                    ← handles invalid_image / uncertain / success states
│       └── locales/
│           ├── en.json
│           └── mr.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Backend

Built with **FastAPI**. The `/predict` endpoint runs images through the leaf validator first, forwards leaf images to the disease model, and logs every scan to the database.

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/predict` | Upload an image (+ optional `lat`/`lon`) — returns disease prediction, confidence, and remedy |
| GET | `/scans` | Returns all logged scans that have location data |
| GET | `/weather-risk` | Returns live weather + disease outbreak risk level for a given `lat`/`lon` |
| GET | `/dashboard/stats` | Returns total scans, pending confirmations, disease counts, and district counts |
| POST | `/feedback` | Submit farmer feedback (`scan_id`, `confirmed`, optional `actual_disease`) on a past prediction |

**Response statuses for `/predict`**

| Status | Meaning |
|---|---|
| `success` | Leaf detected, disease predicted with confidence ≥ 60% |
| `uncertain` | Leaf detected, but disease confidence < 60% |
| `invalid_image` | Image rejected — not recognized as a crop leaf |

**Example rejection response**

```json
{
  "status": "invalid_image",
  "message": "This does not appear to be a crop leaf. Please upload a clear photo of a single crop leaf.",
  "validation_confidence": 98.52
}
```

---

## 🖥️ Frontend

The existing farmer-friendly, bilingual interface is preserved. It handles the `invalid_image` status by showing a clear message instead of attempting to render a disease result.

- **English:** "This does not appear to be a crop leaf. Please upload a clear photo of a single crop leaf."
- **Marathi:** "ही प्रतिमा पिकाच्या पानासारखी दिसत नाही. कृपया एका पिकाच्या पानाचा स्पष्ट फोटो अपलोड करा."

---

## 📥 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/teja41749-cyber/Crop-Disease-Detection.git
   cd Crop-Disease-Detection
   ```

2. **Backend setup**

   ```bash
   cd plant_disease_project-backend
   pip install -r requirements.txt
   uvicorn app:app --reload
   ```

   The SQLite database (`agrigaurd.db`) is created automatically on first run via `init_db()`.

3. **Frontend setup**

   ```bash
   cd plant_disease_project-frontend
   npm install
   npm run dev
   ```

> Ensure `plant_disease_model.keras`, `leaf_validator.keras`, `class_names.json`, `leaf_validator_classes.json`, `remedies.json`, and `database.py` are present in the backend directory before starting the server.

---

## ✅ Current Project Status

**Core AI pipeline**
- [x] Disease detection model (59 classes)
- [x] Disease confidence handling
- [x] Remedy information
- [x] Leaf/Not-Leaf validation
- [x] Non-leaf rejection
- [x] Real-world false-positive fix (IARE logo test case)

**Backend**
- [x] FastAPI
- [x] Disease model integration
- [x] Leaf validator integration
- [x] Explicit API statuses (`success` / `uncertain` / `invalid_image`)
- [x] Persistent scan history (SQLite)
- [x] Weather-based disease risk endpoint
- [x] Farmer feedback endpoint
- [x] Dashboard statistics endpoint

**Frontend**
- [x] Farmer-friendly UI
- [x] English
- [x] Marathi
- [x] Backend integration
- [x] Invalid-image handling

---

## 🗺️ Roadmap

With the leaf-validation fix, scan persistence, weather risk, and feedback loop now in place, the next priorities are:

1. **Disease/pest hotspot map** — visualize `GET /scans` geodata on a map (frontend work)
2. **Agriculture officer / expert dashboard** — a UI layer over `GET /dashboard/stats`
3. **Localized outbreak alerts** — notify farmers in a district when risk crosses a threshold
4. **Farm/crop profile and follow-up monitoring**
5. **Expert validation / referral system**
6. **Offline / PWA support**

---

## 🙌 Contributors

- Core pipeline, leaf validation, backend/frontend — [teja41749-cyber](https://github.com/teja41749-cyber)
- Database layer, weather risk, feedback loop, dashboard stats — Hari

---

## 📄 License

Add your license here.
Disease           Uncertain
                         │
                         ▼
                       Remedy
```

---

## ✨ Features

- 📷 Upload or capture a crop leaf image from a mobile-responsive web UI
- 🍃 **Leaf/Not-Leaf validation** — rejects non-leaf images (logos, objects, people, etc.) before they ever reach the disease model
- 🔬 Disease classification across **59 classes** using MobileNetV2 transfer learning
- 📊 Confidence-based response: `success`, `uncertain`, or `invalid_image`
- 💊 Remedy information for the detected disease
- 🌐 Bilingual interface — **English** and **Marathi**

---

## 🧠 Why Leaf Validation Was Added

The original disease model is a **closed-set classifier** — it always picks the closest match among its 59 disease classes, even for images that aren't crop leaves at all.

**Example of the problem:**

```text
IARE Logo → Disease Model → Mango Anthracnose — 76%   ❌ false positive
```

The disease model only answers *"which known disease does this most resemble?"* — it was never asked *"is this even a leaf?"*. A separate binary validator now handles that question before the image reaches the disease model.

**Same image, after the fix:**

```text
IARE Logo → Leaf Validator → NOT_LEAF (98.52%) → Rejected   ✅
```

### Validator training details

| Item | Value |
|---|---|
| Model | MobileNetV2 (transfer learning, ImageNet) |
| Input size | 128 × 128 |
| Batch size | 32 |
| Optimizer | Adam (lr = 0.0001) |
| Loss | Binary Crossentropy |
| Augmentation | Random flip, rotation, zoom, contrast |
| Class weighting | leaf = 0.531, not_leaf = 8.518 (dataset imbalance correction) |

**Dataset**

| Dataset | Leaf | Not-Leaf | Total |
|---|---:|---:|---:|
| Train | 3,496 | 218 | 3,714 |
| Validation | 749 | 47 | 796 |
| Test | 750 | 47 | 797 |

**Test performance**

| Class | Precision | Recall | F1 |
|---|---:|---:|---:|
| Leaf | 1.0000 | 0.9973 | 0.9987 |
| Not-Leaf | 0.9592 | 1.0000 | 0.9792 |
| **Overall Accuracy** | | **99.75%** | |

Out of 47 not-leaf test images, **0 were misclassified as leaf**; only 2 leaf images were misclassified as not-leaf.

---

## 🏗️ Project Structure

```text
Crop-Disease-Detection/
│
├── plant_disease_project-backend/
│   ├── app.py                         ← FastAPI app (leaf validation + disease prediction)
│   ├── leaf_validator.keras           ← NEW — binary leaf/not-leaf classifier
│   ├── leaf_validator_classes.json    ← NEW
│   ├── plant_disease_model.keras      ← 59-class disease model
│   ├── class_names.json
│   └── remedies.json
│
├── plant_disease_project-frontend/
│   └── src/
│       ├── main.js                    ← handles invalid_image / uncertain / success states
│       └── locales/
│           ├── en.json
│           └── mr.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Backend

Built with **FastAPI**. The `/predict` endpoint runs images through the leaf validator first, and only forwards leaf images to the disease model.

**Response statuses**

| Status | Meaning |
|---|---|
| `success` | Leaf detected, disease predicted with confidence ≥ 60% |
| `uncertain` | Leaf detected, but disease confidence < 60% |
| `invalid_image` | Image rejected — not recognized as a crop leaf |

**Example rejection response**

```json
{
  "status": "invalid_image",
  "message": "This does not appear to be a crop leaf. Please upload a clear photo of a single crop leaf.",
  "validation_confidence": 98.52
}
```

---

## 🖥️ Frontend

The existing farmer-friendly, bilingual interface is preserved. It now also handles the `invalid_image` status by showing a clear message instead of attempting to render a disease result.

- **English:** "This does not appear to be a crop leaf. Please upload a clear photo of a single crop leaf."
- **Marathi:** "ही प्रतिमा पिकाच्या पानासारखी दिसत नाही. कृपया एका पिकाच्या पानाचा स्पष्ट फोटो अपलोड करा."

---

## 📥 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/teja41749-cyber/Crop-Disease-Detection.git
   cd Crop-Disease-Detection
   ```

2. **Backend setup**

   ```bash
   cd plant_disease_project-backend
   pip install -r requirements.txt
   uvicorn app:app --reload
   ```

3. **Frontend setup**

   ```bash
   cd plant_disease_project-frontend
   npm install
   npm run dev
   ```

> Ensure `plant_disease_model.keras`, `leaf_validator.keras`, `class_names.json`, `leaf_validator_classes.json`, and `remedies.json` are present in the backend directory before starting the server.

---

## ✅ Current Project Status

**Core AI pipeline**
- [x] Disease detection model (59 classes)
- [x] Disease confidence handling
- [x] Remedy information
- [x] Leaf/Not-Leaf validation
- [x] Non-leaf rejection
- [x] Real-world false-positive fix (IARE logo test case)

**Backend**
- [x] FastAPI
- [x] Disease model integration
- [x] Leaf validator integration
- [x] Updated `/predict` endpoint
- [x] Explicit API statuses (`success` / `uncertain` / `invalid_image`)

**Frontend**
- [x] Farmer-friendly UI
- [x] English
- [x] Marathi
- [x] Backend integration
- [x] Invalid-image handling

---

## 🗺️ Roadmap

The core detection pipeline is now robust against false positives. Planned next steps, in order of priority:

1. **Weather-based disease risk + location-aware recommendations** *(next up)*
2. Geospatial disease/pest hotspot mapping
3. Farmer feedback and learning loop
4. Agriculture officer / expert dashboard
5. Localized outbreak alerts
6. Farm/crop profile and follow-up monitoring
7. Expert validation / referral system
8. Offline / PWA support

---


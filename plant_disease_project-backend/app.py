from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
import os

app = FastAPI()

# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Model paths
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DISEASE_MODEL_PATH = os.path.join(
    BASE_DIR, "plant_disease_model.keras"
)

LEAF_VALIDATOR_PATH = os.path.join(
    BASE_DIR, "leaf_validator.keras"
)

CLASS_NAMES_PATH = os.path.join(
    BASE_DIR, "class_names.json"
)

REMEDIES_PATH = os.path.join(
    BASE_DIR, "remedies.json"
)

# --------------------------------------------------
# Load models
# --------------------------------------------------

print("Loading disease detection model...")
model = tf.keras.models.load_model(DISEASE_MODEL_PATH)

print("Loading leaf validator...")
leaf_validator = tf.keras.models.load_model(LEAF_VALIDATOR_PATH)

print("Models loaded successfully.")

# --------------------------------------------------
# Load supporting files
# --------------------------------------------------

with open(CLASS_NAMES_PATH) as f:
    class_names = json.load(f)

with open(REMEDIES_PATH) as f:
    remedies = json.load(f)

# --------------------------------------------------
# Image settings
# --------------------------------------------------

IMG_SIZE = (128, 128)

# Leaf validator:
# 0 = leaf
# 1 = not_leaf
#
# The sigmoid output of the validator represents
# the probability of NOT_LEAF.
LEAF_VALIDATOR_THRESHOLD = 0.5

# Existing disease model confidence threshold
DISEASE_CONFIDENCE_THRESHOLD = 0.6


# --------------------------------------------------
# Image preprocessing
# --------------------------------------------------

def preprocess(img_bytes):
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)

    arr = np.array(img, dtype=np.float32)

    return np.expand_dims(arr, axis=0)


# --------------------------------------------------
# Root endpoint
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "Plant Disease Detection API is running"
    }


# --------------------------------------------------
# Prediction endpoint
# --------------------------------------------------

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    try:
        # ------------------------------------------
        # 1. Read uploaded image
        # ------------------------------------------

        img_bytes = await file.read()

        if not img_bytes:
            return {
                "status": "invalid_image",
                "message": "No image was uploaded. Please upload a clear crop leaf image."
            }

        # ------------------------------------------
        # 2. Preprocess image
        # ------------------------------------------

        input_arr = preprocess(img_bytes)

        # ------------------------------------------
        # 3. LEAF VALIDATION
        # ------------------------------------------
        #
        # Validator:
        # sigmoid output = probability of NOT_LEAF
        #
        # Example:
        # 0.98 -> 98% not leaf
        # 0.02 -> 98% leaf
        # ------------------------------------------

        not_leaf_probability = float(
            leaf_validator.predict(
                input_arr,
                verbose=0
            )[0][0]
        )

        leaf_probability = 1.0 - not_leaf_probability

        # ------------------------------------------
        # 4. Reject non-leaf images
        # ------------------------------------------

        if not_leaf_probability >= LEAF_VALIDATOR_THRESHOLD:

            return {
                "status": "invalid_image",
                "message": "This does not appear to be a crop leaf. Please upload a clear photo of a single crop leaf.",
                "validation_confidence": round(
                    not_leaf_probability * 100,
                    2
                )
            }

        # ------------------------------------------
        # 5. LEAF CONFIRMED
        #    Run disease model
        # ------------------------------------------

        preds = model.predict(
            input_arr,
            verbose=0
        )

        idx = int(np.argmax(preds))

        confidence = float(
            np.max(preds)
        )

        predicted_class = class_names[idx]

        # ------------------------------------------
        # 6. Disease confidence check
        # ------------------------------------------

        if confidence < DISEASE_CONFIDENCE_THRESHOLD:

            return {
                "status": "uncertain",
                "confidence": round(
                    confidence * 100,
                    2
                ),
                "warning": "Low confidence — please upload a clearer photo of a single crop leaf."
            }

        # ------------------------------------------
        # 7. Successful prediction
        # ------------------------------------------

        return {
            "status": "success",
            "disease": predicted_class,
            "confidence": round(
                confidence * 100,
                2
            ),
            "remedy": remedies.get(
                predicted_class,
                "No remedy information available."
            )
        }

    except Exception as e:

        print("Prediction error:", str(e))

        return {
            "status": "invalid_image",
            "message": "Unable to process this image. Please upload a clear crop leaf image."
        }
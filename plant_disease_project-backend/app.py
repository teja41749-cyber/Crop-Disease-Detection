from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io, json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model("plant_disease_model.keras")
with open("class_names.json") as f:
    class_names = json.load(f)
with open("remedies.json") as f:
    remedies = json.load(f)

IMG_SIZE = (128, 128)

def preprocess(img_bytes):
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32)
    return np.expand_dims(arr, axis=0)

@app.get("/")
def root():
    return {"status": "Plant Disease Detection API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    img_bytes = await file.read()
    input_arr = preprocess(img_bytes)

    preds = model.predict(input_arr)
    idx = int(np.argmax(preds))
    confidence = float(np.max(preds))
    predicted_class = class_names[idx]

    if confidence < 0.6:
        return {
            "confidence": round(confidence * 100, 2),
            "warning": "Low confidence — please upload a clearer, well-lit photo."
        }

    return {
        "disease": predicted_class,
        "confidence": round(confidence * 100, 2),
        "remedy": remedies.get(predicted_class, "No remedy info available.")
    }

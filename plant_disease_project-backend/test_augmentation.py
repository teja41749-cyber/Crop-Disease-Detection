import tensorflow as tf
import numpy as np

model = tf.keras.models.load_model('plant_disease_model.keras')

# Test if augmentation layers affect inference
# Create a distinctive pattern image
pattern = np.zeros((1, 128, 128, 3), dtype=np.float32)
pattern[0, :, :, 0] = 1.0  # Red channel all 1.0
pattern[0, :, :, 1] = 0.0
pattern[0, :, :, 2] = 0.0

# Test with training=False (default)
preds_inf = model.predict(pattern, verbose=0)
print("Inference mode (training=False):")
print(f"  Max prob: {np.max(preds_inf[0]):.4f}")
print(f"  Argmax: {np.argmax(preds_inf[0])}")

# Test with training=True
preds_train = model(pattern, training=True).numpy()
print("\nTraining mode (training=True):")
print(f"  Max prob: {np.max(preds_train[0]):.4f}")
print(f"  Argmax: {np.argmax(preds_train[0])}")

# Test multiple times in training mode to see augmentation effect
print("\nMultiple training=True calls (should vary due to augmentation):")
for i in range(3):
    p = model(pattern, training=True).numpy()
    print(f"  Call {i+1}: max={np.max(p[0]):.4f}, argmax={np.argmax(p[0])}")

print("\nMultiple inference calls (should be identical):")
for i in range(3):
    p = model.predict(pattern, verbose=0)
    print(f"  Call {i+1}: max={np.max(p[0]):.4f}, argmax={np.argmax(p[0])}")
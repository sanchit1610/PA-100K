from pathlib import Path
import tensorflow as tf
import numpy as np

MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "models"
    / "mobilenetv2_bce_best.keras"
)

ATTRIBUTES = [
    "Female",
    "Front",
    "Side",
    "Back",
    "ShortSleeve",
    "LongSleeve",
    "Hat",
    "Glasses",
    "HandBag",
    "ShoulderBag",
    "Backpack",
    "UpperLogo",
    "UpperPlaid",
    "Trousers",
    "Shorts",
    "Skirt&Dress",
]

print(f"Loading model from: {MODEL_PATH}")

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)


def predict_attributes(image_array):
    predictions = model.predict(
        image_array,
        verbose=0
    )[0]

    return {
        attribute: float(probability)
        for attribute, probability in zip(
            ATTRIBUTES,
            predictions
        )
    }
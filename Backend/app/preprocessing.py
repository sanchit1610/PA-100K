from PIL import Image
import numpy as np
import tensorflow as tf
import io

IMAGE_SIZE = (224, 224)


def preprocess_image(image_bytes: bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(IMAGE_SIZE)

    image_array = np.array(image).astype(np.float32)

    image_array = tf.keras.applications.mobilenet_v2.preprocess_input(
        image_array
    )

    image_array = np.expand_dims(image_array, axis=0)

    return image_array
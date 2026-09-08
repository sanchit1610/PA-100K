from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .preprocessing import preprocess_image
from .model import predict_attributes
from .schemas import PredictionResponse


app = FastAPI(
    title="Pedestrian Attribute Recognition API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "MobileNetV2 + BCE"
    }


@app.post(
    "/predict",
    response_model=PredictionResponse
)
async def predict(file: UploadFile = File(...)):

    if file.content_type not in [
        "image/jpeg",
        "image/png"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG and PNG images are supported."
        )

    try:
        image_bytes = await file.read()

        image_array = preprocess_image(
            image_bytes
        )

        raw = predict_attributes(
            image_array
        )

        gender = {
            "label": "Female" if raw["Female"] >= 0.5 else "Male",
            "confidence": (
                raw["Female"]
                if raw["Female"] >= 0.5
                else 1 - raw["Female"]
            )
        }

        orientation_candidates = {
            "Front": raw["Front"],
            "Side": raw["Side"],
            "Back": raw["Back"]
        }

        orientation_label = max(
            orientation_candidates,
            key=orientation_candidates.get
        )

        orientation = {
            "label": orientation_label,
            "confidence": orientation_candidates[
                orientation_label
            ]
        }

        sleeve_candidates = {
            "ShortSleeve": raw["ShortSleeve"],
            "LongSleeve": raw["LongSleeve"]
        }

        sleeve_label = max(
            sleeve_candidates,
            key=sleeve_candidates.get
        )

        sleeve = {
            "label": sleeve_label,
            "confidence": sleeve_candidates[
                sleeve_label
            ]
        }

        lower_candidates = {
            "Trousers": raw["Trousers"],
            "Shorts": raw["Shorts"],
            "Skirt&Dress": raw["Skirt&Dress"]
        }

        lower_label = max(
            lower_candidates,
            key=lower_candidates.get
        )

        lower_clothing = {
            "label": lower_label,
            "confidence": lower_candidates[
                lower_label
            ]
        }

        attribute_names = [
            "Hat",
            "Glasses",
            "HandBag",
            "ShoulderBag",
            "Backpack",
            "UpperLogo",
            "UpperPlaid"
        ]

        attributes = {
            name: raw[name]
            for name in attribute_names
        }

        return {
            "gender": gender,
            "orientation": orientation,
            "sleeve": sleeve,
            "lower_clothing": lower_clothing,
            "attributes": attributes,
            "raw_predictions": raw
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
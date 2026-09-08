from pydantic import BaseModel
from typing import Dict


class CategoryPrediction(BaseModel):
    label: str
    confidence: float


class PredictionResponse(BaseModel):
    gender: CategoryPrediction
    orientation: CategoryPrediction
    sleeve: CategoryPrediction
    lower_clothing: CategoryPrediction
    attributes: Dict[str, float]
    raw_predictions: Dict[str, float]
from pydantic import BaseModel
from typing import Optional

class RecommendationRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    soilType: str
    temperature: float
    humidity: float
    rainfall: float
    season: str
    waterAvailability: str
    location: Optional[str] = ""

class CropPrediction(BaseModel):
    cropName: str
    crop: Optional[str] = None
    confidence: float
    reasoning: Optional[str] = ""

class RecommendationResponse(BaseModel):
    recommendations: list[CropPrediction]        
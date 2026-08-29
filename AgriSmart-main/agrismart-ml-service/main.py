from fastapi import FastAPI
from predictor import Predictor
from fastapi.middleware.cors import CORSMiddleware
from schemas.recommendation import RecommendationRequest
app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
predictor=Predictor()

@app.post("/recommend")
def recommend(request:RecommendationRequest):
     return predictor.predict(request) 
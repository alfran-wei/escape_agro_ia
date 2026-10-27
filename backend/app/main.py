from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .logic import get_weather_risk, analyze_crop_scenario, draft_advisory, decide_advisory, ADVISORIES

app = FastAPI(title="AgroPilot AI API", version="0.1.0",
              description="Prototype de démonstration : l'agent recommande, un humain décide.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    cooperative: str = Field(default="Coopérative Démo", min_length=2, max_length=100)
    crop: str = "manioc"
    zone: str = "Estuaire"
    rainfall_mm: float = Field(default=110, ge=0, le=1000)
    soil_drainage: str = "unknown"

class DecisionRequest(BaseModel):
    decision: str
    reviewer: str = Field(default="Conseiller agricole", min_length=2, max_length=100)
    note: str = ""

@app.get("/health")
def health():
    return {"status": "ok", "mode": "demo", "data_warning": "Données simulées, non agronomiquement validées."}

@app.get("/api/weather")
def weather(zone: str = "Estuaire", period_days: int = 7):
    if not 1 <= period_days <= 30:
        raise HTTPException(400, "period_days doit être entre 1 et 30")
    return get_weather_risk(zone, period_days)

@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    weather_data = get_weather_risk(req.zone, 7)
    result = analyze_crop_scenario(req.crop, req.zone, req.rainfall_mm, req.soil_drainage)
    advisory = draft_advisory(
        req.cooperative, req.crop, req.zone, result["risk_level"],
        result["reasons"],
        [weather_data["source"], "Paramètres saisis dans le formulaire"]
    )
    return {"analysis": result, "weather": weather_data, "advisory": advisory}

@app.get("/api/advisories")
def list_advisories():
    return list(ADVISORIES.values())

@app.post("/api/advisories/{advisory_id}/decision")
def decision(advisory_id: str, req: DecisionRequest):
    try:
        return decide_advisory(advisory_id, req.decision, req.reviewer, req.note)
    except KeyError:
        raise HTTPException(404, "Avis introuvable")
    except ValueError as exc:
        raise HTTPException(400, str(exc))

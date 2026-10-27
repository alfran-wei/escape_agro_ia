from datetime import datetime, timezone
from uuid import uuid4

# Jeu de démonstration fictif. À remplacer par des données vérifiées.
DEMO_WEATHER = {
    "zone": "Estuaire (scénario fictif)",
    "period_days": 7,
    "rain_risk": "moderate",
    "source": "Données synthétiques de démonstration",
    "updated_at": "2026-10-25T08:00:00Z",
    "limitations": "Ce jeu de données n'est pas une prévision météo réelle."
}

ADVISORIES = {}

def get_weather_risk(zone: str, period_days: int = 7) -> dict:
    return {
        **DEMO_WEATHER,
        "zone": zone,
        "period_days": period_days,
    }

def analyze_crop_scenario(crop: str, zone: str, rainfall_mm: float, soil_drainage: str) -> dict:
    # Heuristique explicable, pas un modèle ML entraîné.
    score = 0
    reasons = []
    if rainfall_mm > 150:
        score += 2
        reasons.append("Cumul de pluie élevé dans le scénario fourni.")
    elif rainfall_mm > 80:
        score += 1
        reasons.append("Cumul de pluie intermédiaire dans le scénario fourni.")
    else:
        reasons.append("Cumul de pluie faible à modéré dans le scénario fourni.")
    if soil_drainage.lower() in {"poor", "faible", "mauvais"}:
        score += 2
        reasons.append("Drainage indiqué comme faible.")
    elif soil_drainage.lower() in {"unknown", "inconnu"}:
        reasons.append("Drainage non renseigné : incertitude importante.")
    risk = "high" if score >= 3 else "moderate" if score >= 1 else "low"
    return {
        "crop": crop,
        "zone": zone,
        "risk_level": risk,
        "score": score,
        "reasons": reasons,
        "method": "Heuristique explicable de démonstration, non validée agronomiquement.",
        "data_status": "synthetic_or_user_supplied"
    }

def draft_advisory(cooperative: str, crop: str, zone: str, risk: str, reasons: list[str], sources: list[str]) -> dict:
    advisory_id = str(uuid4())[:8]
    item = {
        "id": advisory_id,
        "cooperative": cooperative,
        "crop": crop,
        "zone": zone,
        "risk_level": risk,
        "reasons": reasons,
        "sources": sources,
        "status": "pending_review",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "approved_by": None,
        "decision_note": None
    }
    ADVISORIES[advisory_id] = item
    return item

def decide_advisory(advisory_id: str, decision: str, reviewer: str, note: str = "") -> dict:
    if advisory_id not in ADVISORIES:
        raise KeyError("Avis introuvable")
    if decision not in {"approve", "reject"}:
        raise ValueError("La décision doit être approve ou reject")
    item = ADVISORIES[advisory_id]
    if item["status"] != "pending_review":
        raise ValueError("Cet avis a déjà été traité")
    item["status"] = "approved" if decision == "approve" else "rejected"
    item["approved_by"] = reviewer
    item["decision_note"] = note
    item["decided_at"] = datetime.now(timezone.utc).isoformat()
    return item

import asyncio
import os
import sys
from app.logic import ADVISORIES
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .logic import get_weather_risk, analyze_crop_scenario, draft_advisory, decide_advisory, ADVISORIES

async def call_mcp_tool(tool_name: str, arguments: dict):
    params = StdioServerParameters(
        command=sys.executable,
        args=["-m", "app.mcp_server"],
        env={**os.environ, "PYTHONPATH": "."},
    )

    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool(tool_name, arguments)

            if result.isError:
                raise RuntimeError(f"Erreur MCP : {tool_name}")

            return [
                item.text
                for item in result.content
                if getattr(item, "text", None)
            ]

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


class SalesPlanRequest(BaseModel):
    cooperative: str = Field(
        default="Coopérative Démo",
        min_length=2,
        max_length=100,
    )
    stock_kg: float = Field(gt=0, le=1000000)
    harvest_age_days: int = Field(ge=0, le=3650)
    condition: str = "bon"
    storage_conditions: str = "inconnues"
    urgency: str = "moyenne"
    target_sale_days: int = Field(default=7, ge=0, le=365)
    constraints: str = "Aucune précision"


@app.get("/health")
def health():
    return {"status": "ok", "mode": "demo", "data_warning": "Données simulées, non agronomiquement validées."}

@app.get("/api/weather")
def weather(zone: str = "Estuaire", period_days: int = 7):
    if not 1 <= period_days <= 30:
        raise HTTPException(400, "period_days doit être entre 1 et 30")
    return get_weather_risk(zone, period_days)

@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    try:
        weather_result = await call_mcp_tool(
            "get_weather_risk_tool",
            {
                "zone": req.zone,
                "period_days": 7,
            },
        )

        analysis_result = await call_mcp_tool(
            "analyze_crop_scenario_tool",
            {
                "crop": req.crop,
                "zone": req.zone,
                "rainfall_mm": req.rainfall_mm,
                "soil_drainage": req.soil_drainage,
            },
        )

        # Les résultats des outils MCP sont des textes JSON.
        import json

        weather_data = json.loads(weather_result[0])
        analysis_data = json.loads(analysis_result[0])

        advisory_result = await call_mcp_tool(
            "draft_advisory_tool",
            {
                "cooperative": req.cooperative,
                "crop": req.crop,
                "zone": req.zone,
                "risk": analysis_data["risk_level"],
                "reasons": analysis_data["reasons"],
                "sources": [
                    weather_data["source"],
                    "Paramètres saisis dans le formulaire",
                ],
            },
        )

        advisory = json.loads(advisory_result[0])

        ADVISORIES[advisory["id"]] = advisory

        return {
            "weather": weather_data,
            "analysis": analysis_data,
            "advisory": advisory,
            "mcp_used": True,
            "data_warning": (
                "Données synthétiques de démonstration, "
                "non validées comme prévisions agronomiques."
            ),
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Échec de l'appel MCP : {exc}",
        )



@app.post("/api/sales/plan")
async def plan_sales(req: SalesPlanRequest):
    import json

    try:
        # Etape 1 : evaluer la situation declaree du stock.
        stock_result = await call_mcp_tool(
            "assess_cassava_stock_tool",
            {
                "stock_kg": req.stock_kg,
                "harvest_age_days": req.harvest_age_days,
                "condition": req.condition,
                "storage_conditions": req.storage_conditions,
                "urgency": req.urgency,
                "target_sale_days": req.target_sale_days,
                "constraints": req.constraints,
            },
        )

        stock_data = json.loads(stock_result[0])

        # Etape 2 : calculer le plan commercial indicatif.
        plan_result = await call_mcp_tool(
            "plan_cassava_sales_tool",
            {"stock_kg": req.stock_kg},
        )

        plan_data = json.loads(plan_result[0])

        return {
            "cooperative": req.cooperative,
            "stock_assessment": stock_data,
            "sales_plan": plan_data,
            "mcp_used": True,
            "human_approval_required": True,
            "data_warning": (
                "Les acheteurs, prix et capacites sont fictifs. "
                "Le plan est indicatif et ne garantit aucune vente."
            ),
        }

    except (RuntimeError, ValueError, IndexError, KeyError) as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Echec de la planification commerciale : {exc}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur inattendue lors de la planification : {exc}",
        )


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

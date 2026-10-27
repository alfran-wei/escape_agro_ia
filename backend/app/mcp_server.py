"""
Serveur MCP local AgroPilot.
Lancer avec : python -m app.mcp_server depuis le dossier backend.
Ce serveur expose les mêmes outils métier que l'API de démonstration.
"""
from mcp.server.fastmcp import FastMCP
from app.logic import get_weather_risk, analyze_crop_scenario, draft_advisory

mcp = FastMCP("AgroPilot Demo Tools")

@mcp.tool()
def get_weather_risk_tool(zone: str, period_days: int = 7) -> dict:
    """Retourne les données de risque météo disponibles pour une zone et une période."""
    return get_weather_risk(zone, period_days)

@mcp.tool()
def analyze_crop_scenario_tool(crop: str, zone: str, rainfall_mm: float, soil_drainage: str) -> dict:
    """Analyse un scénario agricole à l'aide d'une heuristique explicable de démonstration."""
    return analyze_crop_scenario(crop, zone, rainfall_mm, soil_drainage)

@mcp.tool()
def draft_advisory_tool(cooperative: str, crop: str, zone: str, risk: str, reasons: list[str], sources: list[str]) -> dict:
    """Crée un avis en attente de validation humaine. Ne l'approuve pas."""
    return draft_advisory(cooperative, crop, zone, risk, reasons, sources)

if __name__ == "__main__":
    mcp.run()

"""
Serveur MCP local AgroPilot.
Lancer avec : python -m app.mcp_server depuis le dossier backend.
Ce serveur expose les mêmes outils métier que l'API de démonstration.
"""
import json
from mcp.server.fastmcp import FastMCP
from app.logic import get_weather_risk, analyze_crop_scenario, draft_advisory

mcp = FastMCP("AgroPilot Demo Tools")

# DONNEES FICTIVES : DEMONSTRATION UNIQUEMENT
DEMO_CASSAVA_BUYERS = [
    {
        "id": "ACHETEUR_A",
        "name": "Acheteur A (fictif)",
        "max_quantity_kg": 2000,
        "price_per_kg": 300,
        "transport_cost_per_kg": 40,
    },
    {
        "id": "ACHETEUR_B",
        "name": "Acheteur B (fictif)",
        "max_quantity_kg": 3500,
        "price_per_kg": 260,
        "transport_cost_per_kg": 15,
    },
    {
        "id": "ACHETEUR_C",
        "name": "Acheteur C (fictif)",
        "max_quantity_kg": 1000,
        "price_per_kg": 400,
        "transport_cost_per_kg": 100,
    },
]

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

@mcp.tool()
def compare_cassava_markets_tool(stock_kg: float) -> str:
    """
    Compare des acheteurs fictifs de manioc.

    Calcule pour chaque acheteur :
    - Quantite potentiellement achetable
    - Prix de vente
    - Cout de transport estime
    - Recette nette estimee avant autres charges

    Les acheteurs et prix sont fictifs.
    Aucun contrat ou vente n'est execute.
    """
    if stock_kg <= 0:
        raise ValueError("Le stock doit etre superieur a zero.")

    if stock_kg > 1000000:
        raise ValueError("Stock trop important pour cette demonstration.")

    offers = []

    for buyer in DEMO_CASSAVA_BUYERS:
        quantity = min(
            stock_kg,
            buyer["max_quantity_kg"],
        )

        price = buyer["price_per_kg"]
        transport = buyer["transport_cost_per_kg"]

        gross_revenue = quantity * price
        transport_cost = quantity * transport
        net_revenue = gross_revenue - transport_cost

        offers.append({
            "buyer_id": buyer["id"],
            "buyer_name": buyer["name"],
            "quantity_kg": quantity,
            "price_per_kg_fcfa": price,
            "transport_cost_per_kg_fcfa": transport,
            "gross_revenue_fcfa": gross_revenue,
            "transport_cost_fcfa": transport_cost,
            "estimated_net_revenue_fcfa": net_revenue,
            "remaining_stock_kg": stock_kg - quantity,
        })

    offers.sort(
        key=lambda x: (
            x["estimated_net_revenue_fcfa"]
            / x["quantity_kg"]
        ),
        reverse=True,
    )

    return json.dumps({
        "product": "Manioc",
        "stock_kg": stock_kg,
        "currency": "XAF",
        "data_type": "SYNTHETIC_DEMO",
        "warning": (
            "Acheteurs, prix et couts fictifs. "
            "Estimations avant autres charges, "
            "sans garantie de vente."
        ),
        "offers": offers,
    }, ensure_ascii=False)

@mcp.tool()
def assess_cassava_stock_tool(
    stock_kg: float,
    harvest_age_days: int,
    condition: str,
    storage_conditions: str,
    urgency: str,
    target_sale_days: int,
    constraints: str = "Aucune précision",
) -> str:
    """
    Structure la situation d'un stock de manioc.
    Outil de triage basé sur les informations déclarées.
    Ce n'est pas une prédiction de conservation.
    """
    import json

    if stock_kg <= 0 or stock_kg > 1000000:
        raise ValueError("Stock invalide.")

    if harvest_age_days < 0 or harvest_age_days > 3650:
        raise ValueError("Age de récolte invalide.")

    if target_sale_days < 0 or target_sale_days > 365:
        raise ValueError("Delai de vente invalide.")

    condition = condition.strip().lower()
    urgency = urgency.strip().lower()
    storage_conditions = storage_conditions.strip()

    valid_conditions = {
        "bon",
        "douteux",
        "degrade",
        "inconnu",
    }

    valid_urgencies = {
        "faible",
        "moyenne",
        "elevee",
        "inconnue",
    }

    if condition not in valid_conditions:
        raise ValueError(
            "Condition : bon, douteux, degrade ou inconnu."
        )

    if urgency not in valid_urgencies:
        raise ValueError(
            "Urgence : faible, moyenne, elevee ou inconnue."
        )

    # Priorite operationnelle indicative,
    # basee sur les declarations utilisateur.
    if condition == "degrade":
        priority = "PRIORITE_HAUTE"
        reason = (
            "Etat declare degrade : evaluation rapide "
            "de la qualite et des possibilites de vente."
        )
    elif condition == "douteux":
        priority = "VERIFICATION_REQUISE"
        reason = (
            "Etat incertain : verifier le stock "
            "avant toute decision commerciale."
        )
    elif condition == "inconnu":
        priority = "INFORMATIONS_INSUFFISANTES"
        reason = (
            "Etat du stock inconnu : inspection necessaire."
        )
    elif urgency == "elevee":
        priority = "PRIORITE_HAUTE"
        reason = (
            "La cooperative declare une urgence elevee."
        )
    elif urgency == "inconnue":
        priority = "INFORMATIONS_INSUFFISANTES"
        reason = (
            "L'urgence doit etre clarifiee."
        )
    else:
        priority = "SUIVI"
        reason = (
            "Continuer le suivi et verifier les contraintes."
        )

    result = {
        "tool": "assess_cassava_stock_tool",
        "product": "Manioc",
        "stock_kg": stock_kg,
        "harvest_age_days": harvest_age_days,
        "declared_condition": condition,
        "storage_conditions": storage_conditions,
        "declared_urgency": urgency,
        "target_sale_days": target_sale_days,
        "constraints": constraints,
        "operational_priority": priority,
        "reason": reason,
        "data_type": "USER_DECLARED",
        "limitations": [
            "Ce classement est indicatif.",
            "Ce n'est pas une prediction de deterioration.",
            "Aucune duree de conservation garantie.",
            "Verifier physiquement le stock.",
            "Ne pas commercialiser un produit impropre."
        ],
    }
    return json.dumps(result, ensure_ascii=False)

@mcp.tool()
def plan_cassava_sales_tool(stock_kg: float) -> str:
    """
    Propose une allocation du stock entre acheteurs fictifs.
    Strategie gloutonne selon le revenu net par kg.
    """
    import json

    if stock_kg <= 0 or stock_kg > 1000000:
        raise ValueError("Stock invalide.")

    # Reutilise les donnees demo existantes.
    candidates = []

    for buyer in DEMO_CASSAVA_BUYERS:
        net_per_kg = (
            buyer["price_per_kg"]
            - buyer["transport_cost_per_kg"]
        )

        candidates.append({
            "buyer_id": buyer["id"],
            "buyer_name": buyer["name"],
            "capacity_kg": buyer["max_quantity_kg"],
            "price_per_kg": buyer["price_per_kg"],
            "transport_per_kg": buyer["transport_cost_per_kg"],
            "net_per_kg": net_per_kg,
        })

    # Meilleur net unitaire en premier.
    candidates.sort(
        key=lambda x: x["net_per_kg"],
        reverse=True,
    )

    remaining = float(stock_kg)
    allocations = []
    total_gross = 0
    total_transport = 0

    for buyer in candidates:
        if remaining <= 0:
            break

        # Ignore une offre non rentable.
        if buyer["net_per_kg"] <= 0:
            continue

        quantity = min(
            remaining,
            buyer["capacity_kg"],
        )

        if quantity <= 0:
            continue

        gross = quantity * buyer["price_per_kg"]
        transport = quantity * buyer["transport_per_kg"]
        net = gross - transport

        allocations.append({
            "buyer_id": buyer["buyer_id"],
            "buyer_name": buyer["buyer_name"],
            "quantity_kg": quantity,
            "net_per_kg_fcfa": buyer["net_per_kg"],
            "gross_revenue_fcfa": gross,
            "transport_cost_fcfa": transport,
            "estimated_net_fcfa": net,
        })

        remaining -= quantity
        total_gross += gross
        total_transport += transport

    result = {
        "tool": "plan_cassava_sales_tool",
        "product": "Manioc",
        "stock_initial_kg": stock_kg,
        "allocated_kg": stock_kg - remaining,
        "remaining_stock_kg": remaining,
        "gross_revenue_fcfa": total_gross,
        "transport_cost_fcfa": total_transport,
        "estimated_net_revenue_fcfa": (
            total_gross - total_transport
        ),
        "allocation_strategy": "GREEDY_NET_PER_KG",
        "allocations": allocations,
        "data_type": "SYNTHETIC_DEMO",
        "warning": [
            "Acheteurs, prix et capacites fictifs.",
            "Plan indicatif, non une garantie de vente.",
            "Les delais, qualites et compatibilites "
            "ne sont pas encore modelises.",
            "Verifier les offres avant toute decision.",
            "Validation humaine obligatoire.",
        ],
    }
    return json.dumps(result, ensure_ascii=False)

if __name__ == "__main__":
    mcp.run()

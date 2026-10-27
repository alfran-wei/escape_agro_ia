# AgroPilot AI — Hackathon Starter

Prototype d'agent d'aide à la décision agricole pour une coopérative fictive de manioc dans l'Estuaire, Gabon.

## Objectif du MVP
- Interface web simple pour lancer une analyse.
- API FastAPI.
- Outils métier MCP : météo simulée, analyse de scénario, création d'un avis en attente.
- Validation humaine explicite.
- Mode démo déterministe pour fonctionner sans clé API ni connexion externe.

> Les données incluses sont fictives et servent uniquement à la démonstration.

## Démarrage rapide

### Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API : http://127.0.0.1:8000  
Documentation : http://127.0.0.1:8000/docs

### Frontend
Dans un autre terminal :
```bash
cd frontend
npm install
npm run dev
```
Ouvre l'URL affichée par Vite.

## Structure
- `backend/app/main.py` : endpoints API de démo.
- `backend/app/logic.py` : logique explicable et données simulées.
- `backend/app/mcp_server.py` : serveur MCP séparé avec outils métier.
- `frontend/` : interface React + Vite.
- `docs/DEMO_SCRIPT.md` : scénario de démonstration.
- `docs/EVALS.md` : premiers tests manuels à réaliser.

## Prochaines étapes
1. Remplacer la météo simulée par une source réelle et citer sa provenance.
2. Connecter un modèle open-weight ou une API autorisée pour l'orchestration agentique.
3. Ajouter un serveur MCP tiers réel, en vérifiant sa disponibilité et ses conditions.
4. Ajouter une base persistante si le temps le permet.
5. Ajouter un smart contract testnet uniquement après validation du parcours principal.

## Principe de sécurité
L'agent prépare une recommandation. Un humain décide. Aucun avis n'est marqué comme approuvé sans action explicite.

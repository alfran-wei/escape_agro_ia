# Architecture (version démo)

- Frontend : React + Vite.
- API de démonstration : FastAPI.
- Outils MCP : SDK Python `mcp`, serveur séparé.
- Logique analytique : heuristique explicable, pas de modèle ML entraîné.
- Persistance : mémoire du processus uniquement dans cette première version.
- Sources : données synthétiques clairement étiquetées.

## Limites connues
Le serveur MCP est séparé de l'API HTTP. Pour démontrer l'exigence MCP, connecter un client MCP réel à ce serveur et utiliser un serveur MCP externe réel. L'API HTTP seule ne prouve pas une orchestration MCP.

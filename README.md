# 🌱 Escape Agro AI — Assistant intelligent d’aide à la décision agricole

**Escape Agro AI** est un projet que je développe dans le cadre d’un hackathon. Mon objectif est de concevoir un assistant intelligent capable d’aider les coopératives agricoles à mieux gérer leurs productions, à anticiper les risques et à prendre de meilleures décisions commerciales.

Pour commencer, je me concentre sur une coopérative fictive de producteurs de manioc située dans la province de l’Estuaire, au Gabon. Ce premier cas d’usage me permet de développer et de tester les fonctionnalités principales avant d’envisager une utilisation dans des conditions réelles.

Le projet est actuellement au stade du prototype fonctionnel. Je construis progressivement une plateforme qui combine une interface web, une API backend, des outils métier agricoles et, dans une prochaine étape, une véritable IA conversationnelle.

---

## 🎯 1. Le problème que je cherche à résoudre

Les coopératives agricoles font face à plusieurs difficultés dans la gestion quotidienne de leurs activités.

Parmi les problèmes que je souhaite aborder, il y a notamment :

- **Le manque d'informations pour décider :** les producteurs ont besoin d'informations compréhensibles pour évaluer leur situation et choisir les actions à entreprendre.
- **La gestion des stocks :** le manioc récolté doit être vendu ou transformé dans de bonnes conditions afin de limiter les pertes après récolte.
- **Les décisions commerciales :** déterminer quand vendre, quelle quantité écouler et comment organiser la commercialisation peut être difficile sans outil d'aide à la décision.
- **L'accès aux conseils agricoles :** les informations techniques doivent être présentées de manière simple et adaptée aux besoins des producteurs.
- **Le manque d'outils numériques accessibles :** je souhaite proposer une interface centralisée qui facilite l'accès aux analyses et aux recommandations.

Mon ambition n'est pas de remplacer l'expérience des agriculteurs ou les décisions des responsables de coopératives. Je veux plutôt leur fournir un outil supplémentaire pour mieux comprendre leur situation et prendre des décisions plus éclairées.

## 💡 2. La solution que je propose

Avec AgroPilot AI, je développe une plateforme web qui centralise plusieurs fonctionnalités d'aide à la décision agricole et commerciale.

L'idée est de permettre à un utilisateur de renseigner les informations concernant sa production ou son stock, de lancer une analyse et d'obtenir des recommandations structurées.

À terme, je souhaite également intégrer un assistant conversationnel capable de comprendre les questions formulées en langage naturel, de demander les informations manquantes et d'expliquer les résultats obtenus.

La solution repose sur quatre éléments principaux :

1. **Une interface web** pour accéder aux fonctionnalités et consulter les résultats.
2. **Une API backend** pour traiter les demandes et coordonner les opérations.
3. **Des outils métier agricoles** pour produire des évaluations et des recommandations explicables.
4. **Une couche d'intelligence artificielle conversationnelle**, prévue dans la suite du développement, pour rendre l'utilisation plus naturelle.

Je privilégie une approche progressive : commencer par des fonctionnalités vérifiables, puis intégrer des capacités d'IA plus avancées sans perdre le contrôle sur les décisions importantes.

---

## 🚀 3. Fonctionnalités déjà développées

### 📊 Tableau de bord

- Interface web organisée autour des principales fonctionnalités d'AgroPilot AI.
- Navigation entre le tableau de bord, l'analyse agricole, la gestion commerciale et le chat.
- Présentation des différentes possibilités du prototype.

### 🌾 Analyse agricole

- Formulaire permettant de renseigner les informations nécessaires à une analyse.
- Envoi des données au backend via l'API FastAPI.
- Génération de résultats et de recommandations à partir de la logique métier existante.
- Présentation des résultats dans l'interface.

### 📦 Gestion commerciale du manioc

J'ai développé un module destiné à aider une coopérative à organiser la commercialisation de son stock de manioc.

Les fonctionnalités comprennent notamment :

- La saisie de la quantité disponible.
- La prise en compte de l'âge du stock.
- L'évaluation de l'état du manioc et des conditions de stockage.
- La définition de l'urgence de vente et du délai souhaité.
- La prise en compte de contraintes commerciales.
- La génération d'un plan de vente par le backend.
- L'affichage des résultats dans l'interface commerciale.

L'objectif est d'obtenir une proposition structurée qui aide à préparer la décision de vente, sans exécuter automatiquement une transaction.

### 💬 Chat AgroPilot

J'ai également développé un espace de discussion intégré à l'application.

Le chat dispose actuellement de :

- Une interface de conversation avec historique des messages pendant la session.
- Des suggestions pour accéder aux fonctionnalités agricoles et commerciales.
- Un parcours guidé qui collecte progressivement les informations nécessaires à la préparation d'un plan de vente.
- Un récapitulatif des informations saisies.
- Une étape de confirmation avant la génération du plan.
- Une connexion au backend pour transmettre les données commerciales et récupérer le résultat.

**État actuel :** le parcours conversationnel fonctionne à partir de règles et d'étapes prédéfinies. Il ne s'agit pas encore d'une IA capable de comprendre librement toutes les questions formulées par l'utilisateur.

### 🔌 Backend et outils métier

Le backend repose sur FastAPI et expose notamment les routes suivantes :

| Route | Rôle |
|---|---|
| `POST /api/analyze` | Lancer une analyse agricole |
| `GET /api/weather` | Accéder aux données météo disponibles dans le prototype |
| `POST /api/sales/plan` | Générer un plan de vente |
| `GET /api/advisories` | Consulter les avis disponibles |
| `POST /api/advisories/{advisory_id}/decision` | Enregistrer une décision humaine concernant un avis |

Le projet comprend également un ensemble d'outils métier utilisant le protocole MCP (*Model Context Protocol*), destiné à structurer l'accès aux fonctionnalités agricoles et commerciales.

Les données et résultats de démonstration restent fictifs. Leur présence permet de tester les parcours sans prétendre représenter les conditions réelles du marché gabonais.

---

## 🛠️ 4. Technologies utilisées

| Technologie | Utilisation |
|---|---|
| React | Construction de l'interface web |
| Vite | Développement et lancement du frontend |
| JavaScript | Logique de l'interface et interactions |
| Python | Développement du backend |
| FastAPI | Création de l'API REST |
| MCP | Structuration et exposition des outils métier |
| Git et GitHub | Gestion et suivi du code source |

L'intégration d'un modèle d'IA conversationnelle constitue une prochaine étape du projet. Le fournisseur et le modèle définitifs restent à confirmer.

---

## 🗺️ 5. Fonctionnalités en cours et prochaines étapes

Je souhaite faire évoluer AgroPilot AI progressivement, en privilégiant les fonctionnalités qui apportent une valeur concrète au projet.

### Priorité 1 — Intégrer une véritable IA conversationnelle

- Ajouter une route conversationnelle dédiée, par exemple `POST /api/chat`.
- Connecter le backend à un modèle d'IA via une API autorisée ou une solution compatible.
- Permettre à l'utilisateur de poser des questions en langage naturel.
- Conserver le contexte des échanges pendant une conversation.
- Améliorer la compréhension des demandes et la formulation des réponses.
- Permettre à l'assistant d'orienter l'utilisateur vers les outils métier appropriés.
- Conserver le parcours guidé de vente comme mécanisme fiable de collecte et de validation des données.

### Priorité 2 — Fiabiliser les recommandations agricoles

- Remplacer progressivement les données météo simulées par une source réelle et documentée.
- Indiquer la provenance des données utilisées.
- Améliorer les explications associées aux recommandations.
- Distinguer clairement les observations, les estimations et les recommandations.
- Ajouter des tests pour vérifier les résultats des analyses.

### Priorité 3 — Améliorer l'aide à la décision commerciale

- Approfondir l'évaluation des stocks de manioc et des risques de conservation.
- Améliorer la comparaison des options de commercialisation.
- Intégrer des prix et des informations de marché vérifiables lorsqu'une source fiable est disponible.
- Préciser les hypothèses et les limites des plans de vente générés.
- Éviter de présenter des prix simulés comme des prix réels.

### Priorité 4 — Ajouter une base de données persistante

- Conserver les analyses et les plans de vente.
- Enregistrer les décisions prises par les responsables de coopératives.
- Gérer les utilisateurs et les coopératives si le projet évolue vers un usage réel.
- Permettre de retrouver l'historique des activités après fermeture de l'application.

### Priorité 5 — Renforcer les tests et la sécurité

- Tester les principales routes du backend.
- Vérifier les cas d'erreur et les données invalides.
- Protéger les clés API et les informations sensibles.
- Ajouter une gestion plus robuste des accès si nécessaire.
- Vérifier que les opérations importantes restent soumises à une validation humaine.

### Priorité 6 — Explorer les intégrations avancées

- Étudier l'intégration de serveurs MCP tiers pertinents.
- Explorer, si cela apporte une réelle valeur, l'utilisation d'un smart contract sur un réseau de test.
- Évaluer les contraintes techniques, les coûts et les bénéfices avant toute intégration.

Ces éléments constituent ma feuille de route. Ils ne sont pas tous implémentés à ce stade.

---

## ⚙️ 6. Installation et démarrage

### Prérequis

- Python installé sur la machine.
- Node.js et npm.
- Git pour récupérer le dépôt.

### Lancer le backend

Depuis la racine du projet :

```bash
cd backend
python -m venv .venv
```

Activer l'environnement virtuel.

**Windows :**

```bash
.venv\Scripts\activate
```

**macOS / Linux :**

```bash
source .venv/bin/activate
```

Installer les dépendances et démarrer l'API :

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

L'API est accessible à l'adresse :

http://127.0.0.1:8000

La documentation interactive est disponible à l'adresse :

http://127.0.0.1:8000/docs

### Lancer le frontend

Dans un deuxième terminal :

```bash
cd frontend
npm install
npm run dev
```

Ouvrir ensuite l'adresse locale indiquée par Vite dans le terminal.

---

## 📁 7. Organisation du projet

```text
AgroPilot-AI/
├── backend/
│   └── app/
│       ├── main.py
│       ├── logic.py
│       └── mcp_server.py
├── frontend/
├── docs/
│   ├── DEMO_SCRIPT.md
│   └── EVALS.md
└── README.md
```

- `backend/app/main.py` : routes de l'API et coordination des traitements.
- `backend/app/logic.py` : logique métier, scénarios et données de démonstration.
- `backend/app/mcp_server.py` : serveur MCP et outils métier.
- `frontend/` : interface React et configuration Vite.
- `docs/DEMO_SCRIPT.md` : scénario de démonstration.
- `docs/EVALS.md` : premiers tests manuels et vérifications.

Cette structure correspond à l'organisation prévue du prototype ; elle pourra évoluer avec l'ajout de nouvelles fonctionnalités.

---

## 🔐 8. Principes de sécurité et de fiabilité

Je veux qu'AgroPilot AI reste un outil d'aide à la décision et non un système qui prend des décisions importantes à la place des utilisateurs.

Pour cela, je retiens plusieurs principes :

- **Validation humaine :** un avis ou un plan proposé ne doit pas être considéré comme approuvé sans action explicite.
- **Transparence :** les résultats de démonstration doivent être identifiés comme tels.
- **Protection des secrets :** les clés API ne doivent pas être intégrées au frontend ni publiées sur GitHub.
- **Traçabilité :** les décisions importantes doivent pouvoir être suivies à mesure que le projet évolue.
- **Prudence :** une recommandation générée par l'IA ne constitue pas une garantie de résultat agricole ou commercial.
- **Données vérifiables :** toute intégration de données réelles devra préciser leur provenance et leurs limites.

---

## 🧪 9. État actuel du projet

| Élément | État |
|---|---|
| Interface React | Développée |
| API FastAPI | Développée |
| Analyse agricole | Disponible dans le prototype |
| Module commercial | Développé |
| Parcours guidé dans le chat | Fonctionnel |
| Validation humaine du plan de vente | Intégrée au parcours |
| Outils métier MCP | Présents dans le projet |
| IA conversationnelle réelle | À intégrer |
| Données météo réelles | À intégrer |
| Base de données persistante | À développer |
| Comparaison fondée sur des données de marché réelles | À approfondir |
| Smart contract sur testnet | Piste d'exploration |

---

## 🌍 10. Vision du projet

À terme, je souhaite faire d'AgroPilot AI un assistant numérique capable d'accompagner les coopératives agricoles dans leurs décisions quotidiennes : mieux comprendre leur production, anticiper les risques, organiser la commercialisation et accéder plus facilement à des informations utiles.

Je commence par le manioc dans l'Estuaire, mais l'approche pourrait ensuite être adaptée à d'autres productions agricoles et à d'autres coopératives, à condition de disposer de données et de règles métier adaptées.

Pour moi, la réussite du projet ne dépend pas uniquement de l'utilisation de l'intelligence artificielle. Elle dépend aussi de la fiabilité des données, de la pertinence des recommandations, de la simplicité de l'interface et de la confiance des personnes qui l'utilisent.

**AgroPilot AI est un projet en évolution : je construis d'abord une base fonctionnelle, puis je l'enrichis progressivement avec des capacités d'IA, des données fiables et des outils adaptés aux réalités agricoles du Gabon.**

---

*Projet réalisé dans le cadre d'un hackathon. Les données de démonstration sont fictives et ne doivent pas être utilisées comme références de prix, de météo ou de décisions agricoles réelles.*

# Evals / tests manuels

- [ ] `GET /health` répond avec `status: ok`.
- [ ] Une demande valide retourne une analyse et un avis `pending_review`.
- [ ] Un cumul de pluie plus élevé change le score de la heuristique.
- [ ] Un drainage faible augmente le score de risque.
- [ ] La sortie expose explicitement les limites de la méthode.
- [ ] L'avis en attente peut être approuvé.
- [ ] L'avis en attente peut être rejeté.
- [ ] Une décision sur un identifiant inconnu renvoie 404.
- [ ] Une deuxième décision sur un avis déjà traité est refusée.
- [ ] L'interface affiche les sources et l'état de validation.
- [ ] L'application fonctionne sans API externe.

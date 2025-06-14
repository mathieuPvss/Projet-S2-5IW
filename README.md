# 📚 Projet S2 – 5e année

## 📝 Résumé du projet

Notre projet consiste à développer un **site web** permettant la **recherche de contenus vidéos ou d’articles** portant sur le **développement informatique**, quel que soit le langage de programmation.

L’utilisateur pourra saisir une **requête libre en langage naturel** dans une barre de recherche. Cette requête sera **analysée à l’aide d’OpenAI** afin d’en extraire les **mots-clés pertinents**. Ces mots-clés serviront ensuite à **interroger notre base de données Elasticsearch**, qui contient des **vidéos et articles indexés au préalable**.

L’indexation des contenus s’effectuera à l’aide d’un **cron job** ou d’un système équivalent, qui interrogera régulièrement les différentes **API connectées** (YouTube, TikTok, Stack Overflow, IMDB, etc.). Lorsque les sources ne proposent pas d’API publique, nous procéderons à un **scraping** du site pour récupérer les données pertinentes, ensuite **stockées dans Elasticsearch**.

---

## 🛠️ Technologies utilisées

| Composant               | Technologie                                  |
| ----------------------- | -------------------------------------------- |
| **Frontend**            | Nuxt.js (basé sur Vue.js)                    |
| **Backend**             | NestJS                                       |
| **Base de données**     | PostgreSQL (utilisateurs et entités métiers) |
| **Moteur de recherche** | Elasticsearch                                |
| **Infrastructure**      | K3s (Kubernetes léger sur serveurs locaux)   |

---

## 📦 Structure technique à venir

- 📂 `frontend/` — Application Nuxt.js
- 📂 `backend/` — API NestJS
- 📂 `infra/` — Déploiement K3s et configuration des services

---

## 🚧 Statut du projet

> 🛠 En cours de développement – MVP prévu pour la fin du semestre

---

## 💡 Auteurs

- Mathieu Pannetrat
- Gauthier Lo
- Jean-Paul Hayek

---

## 📄 Licence

Ce projet est sous licence MIT.

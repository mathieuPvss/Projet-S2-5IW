# Auth Service

Microservice d'authentification Express pour Query Forge.

## Fonctionnalités

- Inscription (`/auth/register`)
- Connexion (`/auth/login`)
- Refresh token (`/auth/refresh`)
- JWT compatible avec l'API NestJS

## Variables d'environnement

Voir `.env.example` pour la liste complète.

## Lancement en local

```bash
pnpm install
pnpm dev
```

## Utilisation avec Docker Compose

Ajoutez ce service à votre `compose.yaml` et assurez-vous qu'il utilise les mêmes variables d'environnement que les autres services (notamment la connexion Postgres et le secret JWT).

## Exemple de requêtes

- **POST /auth/register**
  ```json
  { "email": "test@example.com", "password": "monmotdepasse" }
  ```
- **POST /auth/login**
  ```json
  { "email": "test@example.com", "password": "monmotdepasse" }
  ```
- **POST /auth/refresh**
  ```json
  { "refresh_token": "..." }
  ```

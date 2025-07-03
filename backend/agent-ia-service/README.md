# 🤖 Agent Server

Un serveur JavaScript/TypeScript pour interagir avec des agents IA.

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
```

## 🚀 Démarrage rapide

```bash
# Démarrer le serveur en mode production
npm run server

# Ou en mode développement avec rechargement automatique
npm run dev
```

Le serveur sera accessible sur `http://localhost:8080`

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` avec les variables suivantes :

```env
# Configuration API
API_URL=http://localhost:8080
PORT=8080

# Authentification (optionnelle)
BEARER_TOKEN=votre-token-ici
REQUIRE_AUTH=false

# Clés API pour les agents
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
```

## 📡 Endpoints API

### Vérification de santé

```http
GET /health
```

### Liste des agents

```http
GET /agents
Authorization: Bearer your-token
```

### Invocation directe

```http
POST /:agentId/invoke
Authorization: Bearer your-token
Content-Type: application/json

{
  "message": "Votre message",
  "thread_id": "optional-thread-id"
}
```

### Streaming SSE

```http
POST /:agentId/stream
Authorization: Bearer your-token
Content-Type: application/json

{
  "message": "Votre message",
  "thread_id": "optional-thread-id"
}
```

### Arrêter la génération

```http
POST /:agentId/stop
Authorization: Bearer your-token
Content-Type: application/json

{
  "thread_id": "thread-id-to-stop"
}
```

### Gestion des conversations

```http
GET /conversations
GET /conversations/:threadId
Authorization: Bearer your-token
```

## 🔄 Streaming et événements SSE

Le serveur supporte les Server-Sent Events avec les types d'événements suivants :

- `stream_start` - Début du streaming
- `stream_token` - Token de réponse
- `stream_end` - Fin du streaming
- `tool_execution_start` - Début d'utilisation d'outil
- `tool_execution_complete` - Fin d'utilisation d'outil
- `tool_execution_error` - Erreur d'outil
- `error` - Erreur générale

## 🛠️ Structure du projet

```
agent-ia/
├── Agents/              # Agents LangChain
├── serveur/             # Serveur Express.js
│   ├── server.mts      # Serveur principal
│   ├── server-simple.mts # Version simplifiée
│   └── agents-registry.mts # Registre des agents
├── package.json        # Dépendances et scripts
└── README.md          # Documentation
```

## 🔐 Sécurité

- L'authentification par token Bearer est optionnelle (configurable)
- Les tokens sont stockés en mémoire côté serveur
- Les conversations sont en mémoire (remplacer par une DB en production)
- CORS configuré pour accepter toutes les origines (à restreindre en production)

## 📝 Exemples d'utilisation

### Test rapide

```bash
# Terminal 1 - Démarrer le serveur
npm run server

# Terminal 2 - Tester la connectivité
npm run cli check

# Terminal 3 - Commencer à chatter
npm run cli chat
```

### Avec authentification

```bash
# Avec token dans .env
BEARER_TOKEN=mon-super-token npm run server

# Utiliser le même token dans le CLI
npm run cli chat --bearer-token mon-super-token
```

### Mode debug

```bash
# Voir tous les détails des requêtes
npm run cli chat --debug
```

## 🚨 Limitations actuelles

- Agents simulés (MockAgent)
- Stockage en mémoire uniquement
- Pas de persistance des conversations
- Authentification basique
- Pas de rate limiting

## 🎯 Prochaines étapes

- [ ] Intégration avec de vrais agents LangChain
- [ ] Base de données pour la persistance
- [ ] Authentification robuste
- [ ] Rate limiting
- [ ] Interface web
- [ ] Docker
- [ ] Tests automatisés

## 📄 Licence

MIT

---

🚀 **Prêt à discuter avec vos agents IA !**

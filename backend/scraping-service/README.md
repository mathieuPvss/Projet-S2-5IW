# Express Scraper API

🚀 **Serveur Express de scraping dynamique** avec configuration JSON personnalisable.

## ✨ Fonctionnalités

- ✅ **Scraping dynamique** avec configuration JSON
- 🔗 **Suivi de liens** configurable
- 📄 **Pagination automatique**
- 🎯 **Extraction de champs** flexibles (texte et attributs)
- 🛡️ **Validation** robuste des configurations
- ⚡ **Performance** optimisée avec Puppeteer
- 🔒 **Sécurité** avec helmet et validation

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur
npm start

# Mode développement (avec nodemon)
npm run dev
```

## 📡 API Endpoints

### `POST /api/scrape`

Effectue un scraping selon la configuration fournie.

#### Configuration JSON

```json
{
  "startUrl": "https://example.com/products",
  "followLinks": {
    "selector": "a[href*='/questions/']",
    "limit": 10
  },
  "scrapeFields": {
    "title": "h1.product-title",
    "price": ".price-value",
    "description": ".product-description p",
    "image": "img.product-image@src"
  },
  "nextPageSelector": ".pagination-next",
  "maxPages": 5
}
```

#### Paramètres

| Paramètre              | Type   | Requis | Description                             |
| ---------------------- | ------ | ------ | --------------------------------------- |
| `startUrl`             | string | ✅     | URL de départ pour le scraping          |
| `followLinks`          | object | ❌     | Configuration pour suivre les liens     |
| `followLinks.selector` | string | ✅     | Sélecteur CSS pour les liens à suivre   |
| `followLinks.limit`    | number | ❌     | Nombre max de liens (défaut: 10)        |
| `scrapeFields`         | object | ✅     | Champs à extraire avec leurs sélecteurs |
| `nextPageSelector`     | string | ❌     | Sélecteur pour le bouton de pagination  |
| `maxPages`             | number | ❌     | Nombre max de pages (défaut: 5)         |

#### Extraction de champs

- **Texte** : `"selector": "h1.title"`
- **Attribut** : `"selector": "img.photo@src"`
- **Plusieurs éléments** : automatiquement détecté et retourné comme tableau

#### Sélecteurs de pagination

- **Sélecteur CSS** : `"nextPageSelector": ".pagination-next"`
- **Par texte** : `"nextPageSelector": "text:Next"`
- **Par attribut** : `"nextPageSelector": "a[rel='next']"`

#### Réponse

```json
{
  "success": true,
  "startUrl": "https://example.com/products",
  "totalResults": 25,
  "results": [
    {
      "url": "https://example.com/product/1",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "title": "Produit 1",
      "price": "29.99€",
      "description": "Description du produit...",
      "image": "https://example.com/image1.jpg"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### `GET /api/example-config`

Retourne un exemple de configuration avec documentation.

### `GET /health`

Vérification de santé du serveur.

## 🎯 Exemples d'utilisation

### Scraping simple (page unique)

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "startUrl": "https://example.com",
    "scrapeFields": {
      "title": "h1",
      "content": "p"
    }
  }'
```

### Scraping avec suivi de liens

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "startUrl": "https://example.com/products",
    "followLinks": {
      "selector": "a.product-link",
      "limit": 5
    },
    "scrapeFields": {
      "name": "h1.product-name",
      "price": ".price",
      "image": "img.main-image@src"
    }
  }'
```

### Scraping avec pagination

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "startUrl": "https://example.com/articles",
    "scrapeFields": {
      "title": "h2.article-title",
      "date": ".publish-date"
    },
    "nextPageSelector": ".next-page",
    "maxPages": 3
  }'
```

### Scraping avec pagination par texte

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "startUrl": "https://stackoverflow.com/questions",
    "scrapeFields": {
      "title": "h3 a",
      "votes": ".s-post-summary--stats-item:first-child"
    },
    "nextPageSelector": "text:Next",
    "maxPages": 3
  }'
```

### Exemple complet (e-commerce)

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "startUrl": "https://example.com/category/electronics",
    "followLinks": {
      "selector": "a[href*=\"/product/\"]",
      "limit": 10
    },
    "scrapeFields": {
      "title": "h1.product-title",
      "price": ".price-current",
      "originalPrice": ".price-original",
      "rating": ".rating-score",
      "reviews": ".review-count",
      "image": "img.product-image@src",
      "description": ".product-description p"
    },
    "nextPageSelector": ".pagination-next",
    "maxPages": 3,
  }'
```

## 🔧 Comportement du scraper

### Algorithme de scraping

1. **Initialisation** : Lancement du navigateur Puppeteer
2. **Page de départ** : Navigation vers `startUrl`
3. **Pour chaque page** :
   - Si `followLinks` est défini :
     - Récupération des liens selon le sélecteur
     - Visite de chaque lien
     - Extraction des données sur chaque page de lien
     - Retour à la page principale
   - Sinon : extraction directe sur la page actuelle
4. **Pagination** :
   - Vérification du bouton `nextPageSelector`
   - Clic et navigation vers la page suivante
   - Répétition jusqu'à `maxPages` ou absence de bouton
5. **Finalisation** : Fermeture du navigateur et retour des résultats

### Gestion des erreurs

- **Liens brisés** : Ignorés avec log d'erreur
- **Sélecteurs invalides** : Champs vides retournés
- **Pagination** : Arrêt gracieux si bouton indisponible

## 🔒 Sécurité

- Validation stricte des configurations
- Blocage des ressources non nécessaires
- Headers de sécurité avec Helmet
- Pas d'exécution de JavaScript côté client

## 🐛 Dépannage

### Erreur de lancement Puppeteer

```bash
# Sur Linux, installer les dépendances
sudo apt-get install -y chromium-browser

# Sur macOS avec Homebrew
brew install chromium
```

### Problèmes de performance

- Réduire `maxPages` et `followLinks.limit`
- Utiliser des sélecteurs plus spécifiques

### Debugging

```bash
# Logs détaillés
DEBUG=puppeteer:* npm start

# Mode développement
npm run dev
```

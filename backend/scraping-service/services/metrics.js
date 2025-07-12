const { register, Counter, Histogram, Gauge } = require('prom-client');

// Compteur pour les opérations de scraping
const scrapingOperationsCounter = new Counter({
    name: 'scraping_operations_total',
    help: 'Nombre total d\'opérations de scraping',
    labelNames: ['operation_type', 'status']
});

// Histogramme pour la durée des opérations
const scrapingDurationHistogram = new Histogram({
    name: 'scraping_duration_seconds',
    help: 'Durée des opérations de scraping en secondes',
    labelNames: ['operation_type'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300]
});

// Gauge pour le nombre de pages en cours de traitement
const activePagesGauge = new Gauge({
    name: 'scraping_active_pages',
    help: 'Nombre de pages en cours de traitement'
});

// Compteur pour les données extraites
const extractedDataCounter = new Counter({
    name: 'scraping_extracted_data_total',
    help: 'Nombre total de données extraites',
    labelNames: ['field_name']
});

// Compteur pour les erreurs
const scrapingErrorCounter = new Counter({
    name: 'scraping_errors_total',
    help: 'Nombre total d\'erreurs de scraping',
    labelNames: ['error_type']
});

// Gauge pour les ressources utilisées
const browserInstancesGauge = new Gauge({
    name: 'scraping_browser_instances',
    help: 'Nombre d\'instances de navigateur actives'
});

// Compteur pour les pages visitées
const visitedPagesCounter = new Counter({
    name: 'scraping_visited_pages_total',
    help: 'Nombre total de pages visitées'
});

// Compteur pour les liens suivis
const followedLinksCounter = new Counter({
    name: 'scraping_followed_links_total',
    help: 'Nombre total de liens suivis'
});

// Histogramme pour la taille des réponses
const responseSizeHistogram = new Histogram({
    name: 'scraping_response_size_bytes',
    help: 'Taille des réponses en bytes',
    buckets: [1000, 5000, 10000, 50000, 100000, 500000, 1000000]
});

// Fonction pour obtenir les métriques
const getMetrics = () => {
    return register.metrics();
};

// Fonction pour réinitialiser les métriques
const resetMetrics = () => {
    register.resetMetrics();
};

module.exports = {
    scrapingOperationsCounter,
    scrapingDurationHistogram,
    activePagesGauge,
    extractedDataCounter,
    scrapingErrorCounter,
    browserInstancesGauge,
    visitedPagesCounter,
    followedLinksCounter,
    responseSizeHistogram,
    getMetrics,
    resetMetrics,
    register
}; 
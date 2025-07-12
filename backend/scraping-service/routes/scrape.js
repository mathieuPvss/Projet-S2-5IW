const express = require('express');
const { validateScrapeConfig } = require('../utils/validation');
const { ScrapingService } = require('../services/scraping');
const {
    scrapingOperationsCounter,
    scrapingDurationHistogram,
    scrapingErrorCounter,
    extractedDataCounter
} = require('../services/metrics');

const router = express.Router();

// Route POST /scrape
router.post('/scrape', async (req, res) => {
    const timer = scrapingDurationHistogram.startTimer({ operation_type: 'scrape_request' });

    try {
        // Validation des données d'entrée
        const { error, value } = validateScrapeConfig(req.body);
        if (error) {
            scrapingErrorCounter.inc({ error_type: 'validation_error' });
            return res.status(400).json({
                error: 'Configuration invalide',
                details: error.details.map(d => d.message)
            });
        }

        const config = value;

        console.log(`🔍 Début du scraping pour: ${config.startUrl}`);

        // Initialiser le service de scraping
        const scraper = new ScrapingService(config);

        // Exécuter le scraping
        const results = await scraper.scrape();

        console.log(`✅ Scraping terminé: ${results.length} éléments extraits`);

        // Incrémenter les métriques de succès
        scrapingOperationsCounter.inc({ operation_type: 'scrape_request', status: 'success' });

        // Compter les données extraites par champ
        results.forEach(result => {
            Object.keys(result).forEach(field => {
                if (field !== 'url') {
                    extractedDataCounter.inc({ field_name: field });
                }
            });
        });

        res.json({
            success: true,
            startUrl: config.startUrl,
            totalResults: results.length,
            results: results,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erreur lors du scraping:', error);
        scrapingOperationsCounter.inc({ operation_type: 'scrape_request', status: 'error' });
        scrapingErrorCounter.inc({ error_type: 'scraping_error' });

        res.status(500).json({
            error: 'Erreur lors du scraping',
            message: error.message
        });
    } finally {
        timer();
    }
});

// Route GET pour obtenir un exemple de configuration
router.get('/example-config', (req, res) => {
    const exampleConfig = {
        startUrl: "https://example.com/products",
        followLinks: {
            selector: "a[href*='/product/']",
            limit: 10
        },
        scrapeFields: {
            title: "h1.product-title",
            price: ".price-value",
            description: ".product-description p",
            image: "img.product-image@src"
        },
        nextPageSelector: ".pagination-next",
        maxPages: 5,
    };

    res.json({
        example: exampleConfig,
        description: {
            startUrl: "URL de la page de départ",
            followLinks: "Configuration pour suivre les liens",
            scrapeFields: "Champs à extraire (utilisez @attribut pour les attributs)",
            nextPageSelector: "Sélecteur pour la pagination",
            maxPages: "Nombre maximum de pages à traiter",
        }
    });
});

module.exports = router; 
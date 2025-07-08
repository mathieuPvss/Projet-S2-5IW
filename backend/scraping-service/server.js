const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const scrapeRoutes = require('./routes/scrape');

const app = express();
const PORT = process.env.SCRAPING_SERVICE_PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', scrapeRoutes);
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Express Scraper'
    });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({
        error: 'Erreur interne du serveur',
        message: err.message
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route non trouvée',
        path: req.originalUrl
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
    console.log(`❤️  Health check : http://localhost:${PORT}/health`);
});

module.exports = app; 
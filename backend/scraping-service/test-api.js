const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Couleurs pour les logs
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

async function testAPI() {
    console.log(`${colors.blue}🚀 Tests de l'API Express Scraper${colors.reset}`);

    try {
        // Test 1: Health check
        console.log(`\n${colors.yellow}Test 1: Health check${colors.reset}`);
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log(`${colors.green}✅ Health check: ${healthResponse.data.status}${colors.reset}`);

        // Test 2: Example config
        console.log(`\n${colors.yellow}Test 2: Example config${colors.reset}`);
        const exampleResponse = await axios.get(`${BASE_URL}/api/example-config`);
        console.log(`${colors.green}✅ Example config récupéré${colors.reset}`);

        // Test 3: Scraping simple
        console.log(`\n${colors.yellow}Test 3: Scraping simple${colors.reset}`);
        const simpleConfig = {
            startUrl: "https://quotes.toscrape.com/",
            scrapeFields: {
                quote: ".text",
                author: ".author"
            },
        };

        const simpleResponse = await axios.post(`${BASE_URL}/api/scrape`, simpleConfig);
        console.log(`${colors.green}✅ Scraping simple: ${simpleResponse.data.totalResults} résultats${colors.reset}`);

        // Test 4: Scraping avec pagination
        console.log(`\n${colors.yellow}Test 4: Scraping avec pagination (limité à 2 pages)${colors.reset}`);
        const paginationConfig = {
            startUrl: "https://quotes.toscrape.com/",
            scrapeFields: {
                quote: ".text",
                author: ".author"
            },
            nextPageSelector: ".next a",
            maxPages: 2,
        };

        const paginationResponse = await axios.post(`${BASE_URL}/api/scrape`, paginationConfig);
        console.log(`${colors.green}✅ Scraping avec pagination: ${paginationResponse.data.totalResults} résultats${colors.reset}`);

        // Test 5: Validation d'erreur
        console.log(`\n${colors.yellow}Test 5: Validation d'erreur${colors.reset}`);
        try {
            await axios.post(`${BASE_URL}/api/scrape`, { startUrl: "invalid-url" });
        } catch (error) {
            if (error.response.status === 400) {
                console.log(`${colors.green}✅ Validation d'erreur: ${error.response.data.error}${colors.reset}`);
            } else {
                throw error;
            }
        }

        console.log(`\n${colors.green}🎉 Tous les tests ont réussi !${colors.reset}`);

    } catch (error) {
        console.error(`${colors.red}❌ Erreur lors des tests:${colors.reset}`, error.message);
        if (error.response) {
            console.error(`${colors.red}Status:${colors.reset}`, error.response.status);
            console.error(`${colors.red}Data:${colors.reset}`, error.response.data);
        }
    }
}

// Fonction pour tester avec les fichiers d'exemple
async function testWithExampleFiles() {
    console.log(`\n${colors.blue}📁 Tests avec fichiers d'exemple${colors.reset}`);

    const exampleFiles = [
        'simple-scrape.json',
        'author-scrape.json'
    ];

    for (const file of exampleFiles) {
        const filePath = path.join(__dirname, 'examples', file);

        if (fs.existsSync(filePath)) {
            try {
                console.log(`\n${colors.yellow}Test avec ${file}${colors.reset}`);
                const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                const response = await axios.post(`${BASE_URL}/api/scrape`, config);
                console.log(`${colors.green}✅ ${file}: ${response.data.totalResults} résultats${colors.reset}`);

            } catch (error) {
                console.error(`${colors.red}❌ Erreur avec ${file}:${colors.reset}`, error.message);
            }
        }
    }
}

// Exécuter tous les tests
async function runAllTests() {
    await testAPI();
    await testWithExampleFiles();
}

// Exécuter si ce fichier est appelé directement
if (require.main === module) {
    runAllTests();
}

module.exports = { testAPI, testWithExampleFiles, runAllTests }; 
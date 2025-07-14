const axios = require('axios');

// Configuration de test avec sélecteur par texte
const testConfig = {
    startUrl: "https://quotes.toscrape.com/",
    scrapeFields: {
        quote: ".text",
        author: ".author"
    },
    nextPageSelector: "text:Next",
    maxPages: 2
};

async function testTextSelector() {
    try {
        console.log('🚀 Test du sélecteur par texte...');

        const response = await axios.post('http://localhost:3000/api/scrape', testConfig, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Test réussi !');
        console.log(`📊 Résultats: ${response.data.totalResults} éléments trouvés`);
        console.log(`🔗 URL de départ: ${response.data.startUrl}`);
        console.log(`📄 Première citation: "${response.data.results[0]?.quote}"`);

    } catch (error) {
        console.error('❌ Test échoué:', error.message);
        if (error.response) {
            console.error('📝 Détails:', error.response.data);
        }
    }
}

// Lancer le test
testTextSelector(); 
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

class ScrapingService {
    constructor(config) {
        this.config = config;
        this.browser = null;
        this.page = null;
        this.results = [];
    }

    async scrape() {
        try {
            // Initialiser le navigateur
            await this.initBrowser();

            // Commencer le scraping depuis la page de départ
            let currentPage = 1;
            let hasNextPage = true;

            while (hasNextPage && currentPage <= this.config.maxPages) {
                console.log(`📄 Traitement de la page ${currentPage}`);

                // Aller à la page (ou y rester si c'est la première)
                if (currentPage === 1) {
                    await this.page.goto(this.config.startUrl, {
                        waitUntil: 'networkidle2',
                        timeout: 0
                    });
                }

                // Extraire les données de la page actuelle
                await this.scrapePage();

                // Vérifier s'il y a une page suivante
                if (this.config.nextPageSelector) {
                    hasNextPage = await this.goToNextPage();
                } else {
                    hasNextPage = false;
                }

                currentPage++;

            }

            return this.results;
        } finally {
            await this.closeBrowser();
        }
    }

    async initBrowser() {
        this.browser = await puppeteer.launch({
            headless: 'new',
            // executablePath: '/home/pptruser/.cache/puppeteer/chrome/linux-136.0.7103.92/chrome-linux64/chrome',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });

        this.page = await this.browser.newPage();

        // Configurer la page
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await this.page.setViewport({ width: 1280, height: 720 });

        // Bloquer les ressources non nécessaires pour améliorer les performances
        await this.page.setRequestInterception(true);
        this.page.on('request', (req) => {
            if (req.resourceType() === 'stylesheet' || req.resourceType() === 'font' || req.resourceType() === 'image') {
                req.abort();
            } else {
                req.continue();
            }
        });
    }

    async scrapePage() {
        // Si on doit suivre des liens, les récupérer d'abord
        if (this.config.followLinks) {
            await this.followLinksAndScrape();
        } else {
            // Sinon, scraper directement la page actuelle
            await this.extractDataFromCurrentPage();
        }
    }

    async followLinksAndScrape() {
        // Récupérer tous les liens à suivre
        const links = await this.page.evaluate((selector) => {
            const elements = document.querySelectorAll(selector);
            return Array.from(elements).map(el => el.href).filter(href => href);
        }, this.config.followLinks.selector);

        console.log(`🔗 ${links.length} liens trouvés`);

        // Limiter le nombre de liens selon la configuration
        const limitedLinks = links.slice(0, this.config.followLinks.limit || 10);

        // Sauvegarder l'URL de la page actuelle
        const originalUrl = this.page.url();

        // Visiter chaque lien
        for (let i = 0; i < limitedLinks.length; i++) {
            const link = limitedLinks[i];

            try {
                console.log(`🔍 Visite du lien ${i + 1}/${limitedLinks.length}: ${link}`);

                // Aller au lien
                await this.page.goto(link, {
                    waitUntil: 'networkidle2',
                    timeout: 0
                });

                // Extraire les données
                await this.extractDataFromCurrentPage();

                // Retourner à la page originale
                await this.page.goto(originalUrl, {
                    waitUntil: 'networkidle2',
                    timeout: 0
                });
            } catch (error) {
                console.error(`❌ Erreur lors du traitement du lien ${link}:`, error.message);
            }
        }
    }

    async extractDataFromCurrentPage() {
        const html = await this.page.content();
        const $ = cheerio.load(html);
        const currentUrl = this.page.url();

        const extractedData = {
            url: currentUrl,
            timestamp: new Date().toISOString()
        };

        // Extraire chaque champ configuré
        for (const [fieldName, selector] of Object.entries(this.config.scrapeFields)) {
            try {
                // Vérifier si on doit extraire un attribut
                if (selector.includes('@')) {
                    const [cssSelector, attribute] = selector.split('@');
                    const elements = $(cssSelector);

                    if (elements.length > 0) {
                        if (elements.length === 1) {
                            extractedData[fieldName] = elements.first().attr(attribute) || '';
                        } else {
                            extractedData[fieldName] = elements.map((_, el) => $(el).attr(attribute) || '').get();
                        }
                    } else {
                        extractedData[fieldName] = '';
                    }
                } else {
                    // Extraire le texte
                    const elements = $(selector);

                    if (elements.length > 0) {
                        if (elements.length === 1) {
                            extractedData[fieldName] = elements.first().text().trim();
                        } else {
                            extractedData[fieldName] = elements.map((_, el) => $(el).text().trim()).get();
                        }
                    } else {
                        extractedData[fieldName] = '';
                    }
                }
            } catch (error) {
                console.error(`❌ Erreur lors de l'extraction du champ ${fieldName}:`, error.message);
                extractedData[fieldName] = '';
            }
        }

        this.results.push(extractedData);
        console.log(`✅ Données extraites de: ${currentUrl}`);
    }

    async goToNextPage() {
        try {
            let nextButton = null;

            // Vérifier si c'est un sélecteur par texte (format: text:Next)
            if (this.config.nextPageSelector.startsWith('text:')) {
                const searchText = this.config.nextPageSelector.substring(5); // Enlever 'text:'

                // Chercher un élément <a> qui contient le texte spécifié
                nextButton = await this.page.evaluateHandle((text) => {
                    const links = Array.from(document.querySelectorAll('a'));
                    return links.find(link => link.textContent.trim().includes(text));
                }, searchText);


                if (!nextButton.asElement()) {
                    console.log(`🔚 Bouton avec le texte "${searchText}" non trouvé`);
                    return false;
                }
            } else {
                // Sélecteur CSS classique
                nextButton = await this.page.$(this.config.nextPageSelector);

                if (!nextButton) {
                    console.log('🔚 Bouton de pagination suivante non trouvé');
                    return false;
                }
            }

            // Vérifier si le bouton est cliquable
            const isClickable = await this.page.evaluate((element) => {
                if (!element) return false;
                return !element.disabled &&
                    getComputedStyle(element).visibility !== 'hidden' &&
                    getComputedStyle(element).display !== 'none';
            }, nextButton);

            if (!isClickable) {
                console.log('🔚 Bouton de pagination suivante non cliquable');
                return false;
            }

            const buttonHTML = await this.page.evaluate((element) => {
                return {
                    outerHTML: element.outerHTML,
                    innerHTML: element.innerHTML,
                    textContent: element.textContent.trim(),
                    tagName: element.tagName,
                    className: element.className,
                    id: element.id,
                    href: element.href || null,
                    disabled: element.disabled,
                    title: element.title || null
                };
            }, nextButton);


            // Cliquer sur le bouton
            if (buttonHTML.href) {
                console.log(`🔗 Navigation directe vers: ${buttonHTML.href}`);
                await this.page.goto(buttonHTML.href, {
                    waitUntil: 'networkidle2',
                    timeout: 0
                });
            } else {
                // Fallback: essayer le click si pas de href
                await Promise.all([
                    this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 }),
                    nextButton.click()
                ]);
            }

            console.log('➡️ Navigation vers la page suivante');
            return true;

        } catch (error) {
            console.error('❌ Erreur lors de la navigation vers la page suivante:', error.message);
            return false;
        }
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

module.exports = { ScrapingService }; 
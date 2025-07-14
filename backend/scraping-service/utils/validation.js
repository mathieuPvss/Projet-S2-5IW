const Joi = require('joi');

const scrapeConfigSchema = Joi.object({
    startUrl: Joi.string().uri().required()
        .description('URL de départ pour le scraping'),

    followLinks: Joi.object({
        selector: Joi.string().required()
            .description('Sélecteur CSS pour les liens à suivre'),
        limit: Joi.number().integer().optional()
            .description('Nombre maximum de liens à suivre')
    }).optional(),

    scrapeFields: Joi.object().pattern(
        Joi.string(),
        Joi.string()
    ).required()
        .description('Champs à extraire avec leurs sélecteurs CSS'),

    nextPageSelector: Joi.string().optional()
        .description('Sélecteur CSS pour le bouton de pagination'),

    maxPages: Joi.number().integer().default(1)
        .description('Nombre maximum de pages à traiter'),

});

function validateScrapeConfig(config) {
    return scrapeConfigSchema.validate(config, {
        abortEarly: false,
        allowUnknown: false
    });
}

module.exports = {
    validateScrapeConfig,
    scrapeConfigSchema
}; 
'use strict';

const { sanitizeEntity } = require('strapi-utils');
const { getLinkPreview } = require('link-preview-js');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async find(ctx) {
        console.log('lol');
        let entities;
        if (ctx.query._q) {
            entities = await strapi.services.publication.search(ctx.query);
        } else {
            entities = await strapi.services.publication.find(ctx.query);
        }

        return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.publication }));
    },
    async getPreviewFromContent(ctx) {

        const { content } = ctx.request.body

        let response = {}

        if (content) {

            try {
                let linkPreview = await getLinkPreview(content)
                if (linkPreview) response = linkPreview;
            }
            catch (err) {
            }
        }

        return response
    }
};

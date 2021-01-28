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
    },
    async create(ctx) {
        let entity;

        const { items, ...publication } = ctx.request.body

        entity = await strapi.query('publication').create(publication);

        console.log('publication', entity);

        //For each items, we have to create a publication item and add it the the created publication
        const publicationItems = await Promise.all(items.map(async item => {

            console.log('item id', item.id);
            console.log('item type', item.type);

            let publicationItemEntity;

            publicationItemEntity = await strapi.query('publication-item').create({ category: item.type, publication: entity.id })

            let publicationSpecificItemEntity;

            console.log('publicationItemEntity', publicationItemEntity);

            switch (item.type) {
                case 'drone':
                    publicationSpecificItemEntity = await strapi.query('publication-item-drone').create({ publication_item: publicationItemEntity.id, drone: item.id })
                case 'gear':
                    publicationSpecificItemEntity = await strapi.query('publication-item-gear').create({ publication_item: publicationItemEntity.id, gear: item.id })
                case 'battery':
                    publicationSpecificItemEntity = await strapi.query('publication-item-battery').create({ publication_item: publicationItemEntity.id, battery: item.id })
                case 'drone_part':
                    publicationSpecificItemEntity = await strapi.query('publication-item-drone-part').create({ publication_item: publicationItemEntity.id, drone_part: item.id })
                case 'profile':
                    publicationSpecificItemEntity = await strapi.query('publication-item-profile').create({ publication_item: publicationItemEntity.id, profile: item.id })
                case 'spot':
                    publicationSpecificItemEntity = await strapi.query('publication-item-spot').create({ publication_item: publicationItemEntity.id, spot: item.id })
            }

            if (item.type === 'drone') publicationSpecificItemEntity = await strapi.query('publication-item-drone').create({ publication_item: publicationItemEntity.id, drone: item.id })
            else if (item.type === 'gear') publicationSpecificItemEntity = await strapi.query('publication-item-gear').create({ publication_item: publicationItemEntity.id, gear: item.id })
            else if (item.type === 'battery') publicationSpecificItemEntity = await strapi.query('publication-item-battery').create({ publication_item: publicationItemEntity.id, battery: item.id })
            else if (item.type === 'drone_part') publicationSpecificItemEntity = await strapi.query('publication-item-drone-part').create({ publication_item: publicationItemEntity.id, drone_part: item.id })
            else if (item.type === 'profile') publicationSpecificItemEntity = await strapi.query('publication-item-profile').create({ publication_item: publicationItemEntity.id, profile: item.id })
            else if (item.type === 'spot') publicationSpecificItemEntity = await strapi.query('publication-item-spot').create({ publication_item: publicationItemEntity.id, spot: item.id })



            return { id: publicationItemEntity.id }
        }))

        //And finally add all those fine items to the correct publication
        entity = await strapi.query('publication').update({ id: entity.id }, { publication_items: publicationItems });

        return sanitizeEntity(entity, { model: strapi.models.publication });
    },
};

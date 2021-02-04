'use strict';

const { sanitizeEntity } = require('strapi-utils');
const { getLinkPreview } = require('link-preview-js');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async find(ctx) {
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

        const publicationItems = await strapi.services.publication.createPublicationItems(items, entity.id);

        console.log(publicationItems);

        //And finally add all those fine items to the correct publication
        entity = await strapi.query('publication').update({ id: entity.id }, { publication_items: publicationItems });

        return sanitizeEntity(entity, { model: strapi.models.publication });
    },
    async update(ctx) {
        const { id } = ctx.params;

        let entity;

        const profile = await strapi.services.profile.findOne({ user: ctx.state.user.id }, [])

        const publication = await strapi.services.publication.findOne({
            id: ctx.params.id,
            'publisher.id': profile.id,
        });

        if (!publication) {
            return ctx.unauthorized(`You can't update this entry`);
        }

        let { items, ...body } = ctx.request.body

        //Ugly as fuck - No time to do it better
        await strapi.services.publication.resetPublicationItems(id);
        const publicationItems = await strapi.services.publication.createPublicationItems(items, id);

        body.publication_items = publicationItems

        console.log('publication body', body)

        entity = await strapi.query('publication').update({ id: id }, body);

        return sanitizeEntity(entity, { model: strapi.models.publication });
    },
    async delete(ctx) {
        const { id } = ctx.params;

        let entity;

        const profile = await strapi.services.profile.findOne({ user: ctx.state.user.id }, [])

        const publication = await strapi.services.publication.findOne({
            id: ctx.params.id,
            'publisher.id': profile.id,
        });

        if (!publication) {
            return ctx.unauthorized(`You can't delete this entry`);
        }

        entity = await strapi.services.publication.delete({ id });
        return {}
    },
};

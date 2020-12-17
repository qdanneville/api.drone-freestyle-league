'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require('strapi-utils');

module.exports = {
    async create(ctx) {
        let entity;

        const { droneId, ...body } = ctx.request.body

        entity = await strapi.query('drone-parts').create(body);

        console.log('drone id', droneId);

        const currentDrone = await strapi.query('drone').findOne({ id: droneId }, ['drone_parts'])
        let newDroneParts = currentDrone.drone_parts

        //Adding the created gear to the current user profile pilot
        if (entity) {
            newDroneParts.push(entity);
            await strapi.query('drone').update({ id: droneId }, { drone_parts: newDroneParts })
        }

        return entity;
    },
    async update(ctx) {
        const { id } = ctx.params;

        let entity;

        const profile = await strapi.services.profile.findOne({ user: ctx.state.user.id }, [])

        const dronePart = await strapi.query('drone-parts').findOne({
            id: ctx.params.id,
            'creator.id': profile.id,
        });

        if (!dronePart) {
            return ctx.unauthorized(`You can't update this entry`);
        }

        entity = await strapi.query('drone-parts').update({ id }, ctx.request.body);

        return entity;
    },
    async delete(ctx) {
        const { id } = ctx.params;

        let entity;

        const profile = await strapi.services.profile.findOne({ user: ctx.state.user.id }, [])

        const dronePart = await strapi.query('drone-parts').findOne({
            id: ctx.params.id,
            'creator.id': profile.id,
        });

        if (!dronePart) {
            return ctx.unauthorized(`You can't delete this entry`);
        }

        entity = await strapi.services.battery.delete({ id });
        return {}
    },
};

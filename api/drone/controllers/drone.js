'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
    async create(ctx) {
        let entity;

        entity = await strapi.query('drone').create(ctx.request.body);

        const profile = await strapi.services.profile.findOne({ user: ctx.state.user.id }, [])
        const pilot = await strapi.services.pilot.findOne({ profile: profile.id }, [])
        const currentPilotDrones = await strapi.query('pilot-gear').findOne({ pilot: pilot.id }, ['drones'])
        let newPilotDrones = currentPilotDrones.drones


        //Adding the created gear to the current user profile pilot
        if (entity) {
            newPilotDrones.push(entity);
            await strapi.query('pilot-gear').update({ pilot: pilot.id }, { drones: newPilotDrones })
        }

        return sanitizeEntity(entity, { model: strapi.models.drone });
    },
    async update(ctx) {
        const { id } = ctx.params;

        let entity;

        const profile = await strapi.services.profile.findOne({ user: ctx.state.user.id }, [])

        const drone = await strapi.services.drone.findOne({
            id: ctx.params.id,
            'creator.id': profile.id,
        });

        if (!drone) {
            return ctx.unauthorized(`You can't update this entry`);
        }

        entity = await strapi.services.drone.update({ id }, ctx.request.body);
        return sanitizeEntity(entity, { model: strapi.models.drone });
    },
    async delete(ctx) {
        const { id } = ctx.params;

        let entity;

        const profile = await strapi.services.profile.findOne({ user: ctx.state.user.id }, [])

        const drone = await strapi.services.drone.findOne({
            id: ctx.params.id,
            'creator.id': profile.id,
        });

        if (!drone) {
            return ctx.unauthorized(`You can't delete this entry`);
        }

        entity = await strapi.services.drone.delete({ id });
        return {}
    },
};

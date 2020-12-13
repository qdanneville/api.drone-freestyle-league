'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
    async create(ctx) {
        let entity;
        entity = await strapi.services.gear.create(ctx.request.body);

        const profile = await strapi.services.profile.findOne({ user: ctx.state.user.id }, [])
        const pilot = await strapi.services.pilot.findOne({ profile: profile.id }, [])
        const currentPilotGear = await strapi.query('pilot-gear').findOne({ pilot: pilot.id }, ['gears'])
        let newPilotGear = currentPilotGear.gears

        //Adding the created gear to the current user profile pilot
        if (entity) {
            newPilotGear.push(entity);
            await strapi.query('pilot-gear').update({ pilot: pilot.id }, { gears: newPilotGear })
        }

        return sanitizeEntity(entity, { model: strapi.models.gear });
    },
    async update(ctx) {
        const { id } = ctx.params;

        let entity;

        const profile = await strapi.services.profile.findOne({ user: ctx.state.user.id }, [])

        const gear = await strapi.services.gear.findOne({
            id: ctx.params.id,
            'creator.id': profile.id,
        });

        if (!gear) {
            return ctx.unauthorized(`You can't update this entry`);
        }

        entity = await strapi.services.gear.update({ id }, ctx.request.body);
        return sanitizeEntity(entity, { model: strapi.models.gear });
    },
    async delete(ctx) {
        const { id } = ctx.params;

        let entity;

        const profile = await strapi.services.profile.findOne({ user: ctx.state.user.id }, [])

        const gear = await strapi.services.gear.findOne({
            id: ctx.params.id,
            'creator.id': profile.id,
        });

        if (!gear) {
            return ctx.unauthorized(`You can't delete this entry`);
        }

        entity = await strapi.services.gear.delete({ id });
        return {}
    },
};

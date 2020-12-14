'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require('strapi-utils');

module.exports = {
    async create(ctx) {
        let entity;
        entity = await strapi.services.battery.create(ctx.request.body);

        const profile = await strapi.services.profile.findOne({ user: ctx.state.user.id }, [])
        const pilot = await strapi.services.pilot.findOne({ profile: profile.id }, [])
        const currentPilotBatteries = await strapi.query('pilot-gear').findOne({ pilot: pilot.id }, ['batteries'])
        let newPilotBatteries = currentPilotBatteries.batteries

        //Adding the created gear to the current user profile pilot
        if (entity) {
            newPilotBatteries.push(entity);
            await strapi.query('pilot-gear').update({ pilot: pilot.id }, { batteries: newPilotBatteries })
        }

        return sanitizeEntity(entity, { model: strapi.models.battery });
    },
    async update(ctx) {
        const { id } = ctx.params;

        let entity;

        const profile = await strapi.services.profile.findOne({ user: ctx.state.user.id }, [])

        const battery = await strapi.services.battery.findOne({
            id: ctx.params.id,
            'creator.id': profile.id,
        });

        if (!battery) {
            return ctx.unauthorized(`You can't update this entry`);
        }

        entity = await strapi.services.battery.update({ id }, ctx.request.body);
        return sanitizeEntity(entity, { model: strapi.models.battery });
    },
    async delete(ctx) {
        const { id } = ctx.params;

        let entity;

        const profile = await strapi.services.profile.findOne({ user: ctx.state.user.id }, [])

        const battery = await strapi.services.battery.findOne({
            id: ctx.params.id,
            'creator.id': profile.id,
        });

        if (!battery) {
            return ctx.unauthorized(`You can't delete this entry`);
        }

        entity = await strapi.services.battery.delete({ id });
        return {}
    },
};

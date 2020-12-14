'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    findPilotGear: async (ctx) => {
        if (ctx.request && ctx.request.header && ctx.request.header.authorization) {

            let pilotId = null;

            //If a user requests his own gears
            if (!ctx.query.pilot) {
                const { id } = await strapi.plugins[
                    'users-permissions'
                ].services.jwt.getToken(ctx);

                const fetchProfile = await strapi
                    .query('profile')
                    .findOne({ user: id }, ['id']);

                const fetchPilot = await strapi
                    .query('pilot')
                    .findOne({ profile: fetchProfile.id }, ['id']);

                if (!fetchPilot) {
                    return ctx.unauthorized(`Can't find this pilot`);
                }

                pilotId = fetchPilot.id
            } else {
                //If a user requests an other pilot gears
                pilotId = ctx.query.pilot
            }

            const url = ctx.request.url;
            let entities = []

            if (url.includes('accessories')) {
                entities = await strapi.query('pilot-gear').findOne({ pilot: pilotId }, ['gears', 'gears.image', 'gears.gear_type', 'gears.manufacturer'])
                entities = entities ? entities.gears : []
            } else if (url.includes('drones')) {
                entities = await strapi.query('pilot-gear').findOne({ pilot: pilotId }, ['drones', 'drones.image'])
                entities = entities ? entities.drones : []
            } else if (url.includes('batteries')) {
                entities = await strapi.query('pilot-gear').findOne({ pilot: pilotId }, ['batteries', 'batteries.image', 'batteries.battery_type', 'batteries.manufacturer'])
                entities = entities ? entities.batteries : []
            } else {
                entities = await strapi.query('pilot-gear').findOne({ pilot: pilotId }, ['batteries', 'drones', 'gears', 'gears.image', 'gears.gear_type', 'gears.manufacturer', 'drones.image', 'drones.drone_type', 'drones.manufacturer', 'batteries.image', 'batteries.battery_type', 'batteries.manufacturer'])
            }

            return entities
        }
    }
};

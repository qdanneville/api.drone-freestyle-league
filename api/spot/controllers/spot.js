'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    getMapSpots: async (ctx) => {

        if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
            try {
                const { id } = await strapi.plugins[
                    'users-permissions'
                ].services.jwt.getToken(ctx);

                const profile = await strapi
                    .query('profile')
                    .findOne({ user: id });

                const pilot = await strapi
                    .query('pilot')
                    .findOne({ profile: profile.id });

                //Get public spots
                const publicSpots = await strapi
                    .query('spot')
                    .find({ public: true });

                //Get pilot spots
                const pilotSpots = await strapi
                    .query('spot')
                    .find({ pilot: pilot.id, public: false });


                //Once we get all spots, we're creating a new feature
                //A feature is a mapbox feature object in order to be displayed on the map
                const publicSpotsFeatures = publicSpots.map(spot => {
                    return strapi.services.spot.createSpotFeature(spot)
                })

                const pilotSpotsFeatures = pilotSpots.map(spot => {
                    return strapi.services.spot.createSpotFeature(spot)
                })

                if (publicSpotsFeatures && pilotSpotsFeatures) return { publicSpotsFeatures, pilotSpotsFeatures }
            }

            catch (err) {
                return ctx.badRequest(
                    null,
                    formatError({
                        id: 'Spot.map.prohibited',
                        message: "Impossible to find spots.",
                    })
                );
            }
        }
    }
};

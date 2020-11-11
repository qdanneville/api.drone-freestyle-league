'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const formatError = error => [
    { messages: [{ id: error.id, message: error.message, field: error.field }] },
];

module.exports = {
    findOne: async (ctx) => {
        if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
            try {
                const { id } = await strapi.plugins[
                    'users-permissions'
                ].services.jwt.getToken(ctx);

                const spot = await strapi.query('spot').findOne({ slug: ctx.params.slug })

                //If the spot is public, everyone can see it
                if (spot.public) return spot

                const profile = await strapi
                    .query('profile')
                    .findOne({ user: id });

                const pilot = await strapi
                    .query('pilot')
                    .findOne({ profile: profile.id });

                console.log('SPOT', spot);
                console.log('PROFILE', profile);
                console.log('PILOT', pilot);

                //A pilot can't get other pilots spots
                //Unless the spot is public
                //Or the spot is shared with him (among friends)
                if (pilot.id === spot.pilot.id) return spot
                else throw true
            }
            catch (err) {
                return ctx.badRequest(
                    null,
                    formatError({
                        id: 'Spot.prohibited',
                        message: "Impossible to find this spot.",
                    })
                );
            }
        }
    },
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
                let publicSpots = await strapi
                    .query('spot')
                    .find({ public: true });

                //Get pilot spots
                const pilotSpots = await strapi
                    .query('spot')
                    .find({ pilot: pilot.id, public: false });


                // Adding a profile object corresponding the public spot pilot profile
                publicSpots = await Promise.all(publicSpots.map(async spot => {
                    const publicPilotProfile = await strapi.query('profile').findOne({ id: spot.pilot.profile })
                    spot.profile = publicPilotProfile;
                    return spot;
                }));

                //Once we get all spots, we're creating a new feature
                //A feature is a mapbox feature object in order to be displayed on the map
                const publicSpotsFeatures = publicSpots.map(spot => {
                    return strapi.services.spot.createSpotFeature(spot)
                })

                const pilotSpotsFeatures = pilotSpots.map(spot => {
                    //Adding a profile object corresponding the current user
                    spot.profile = profile
                    return strapi.services.spot.createSpotFeature(spot)
                })

                //TODO optimize data sent with only needed object

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
    },
    getMySpots: async (ctx) => {
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

                const mySpots = await strapi
                    .query('spot')
                    .find({ pilot: pilot.id });


                //The pilot object inside our spot object isn't needed
                const mySpotsWithoutPilotInformation = mySpots.map(spot => {
                    const { pilot, ...rest } = spot;
                    return rest
                })

                if (mySpots) return mySpotsWithoutPilotInformation
            }
            catch (err) {
                return ctx.badRequest(
                    null,
                    formatError({
                        id: 'Spot.mine.prohibited',
                        message: "Impossible to find my spots.",
                    })
                );
            }
        }
    }
};

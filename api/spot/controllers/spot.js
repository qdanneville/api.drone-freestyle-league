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
        //A pilot can't get other pilots spots
        //Unless the spot is public
        //Or if the spot is shared with him (among friends)

        if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
            try {
                const { id } = await strapi.plugins[
                    'users-permissions'
                ].services.jwt.getToken(ctx);

                const spot = await strapi.query('spot').findOne({ slug: ctx.params.slug })

                const profile = await strapi
                    .query('profile')
                    .findOne({ user: id });

                const pilot = await strapi
                    .query('pilot')
                    .findOne({ profile: profile.id });

                //We want to know if the user who request the spot is the creator to edit the spot
                if (pilot.id === spot.pilot.id) {
                    spot.canEdit = true;
                    spot.profile = profile
                } else {
                    spot.profile = await strapi.query('profile').findOne({ id: spot.pilot.profile })
                }

                //If the spot is public, everyone can see it
                if (spot.public) return spot

                let isMyFriendSpot = await strapi.services.spot.isMyFriendSpot(spot, profile);


                if (isMyFriendSpot !== -1) return spot
                else if (pilot.id === spot.pilot.id) return spot
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

                const friendsSpots = await strapi.services.spot.getFriendsSpots(profile, ctx.query)

                //Once we get all spots, we're creating a new feature
                //A feature is a mapbox feature object in order to be displayed on the map
                const publicSpotsFeatures = publicSpots.map(spot => {
                    return strapi.services.spot.createSpotFeature(spot)
                })

                const friendsSpotsFeatures = friendsSpots.map(spot => {
                    return strapi.services.spot.createSpotFeature(spot)
                })

                const pilotSpotsFeatures = pilotSpots.map(spot => {
                    //Adding a profile object corresponding the current user
                    spot.profile = profile
                    return strapi.services.spot.createSpotFeature(spot)
                })

                //TODO optimize data sent with only needed object
                if (publicSpotsFeatures && pilotSpotsFeatures && friendsSpotsFeatures) return { publicSpotsFeatures, friendsSpotsFeatures, pilotSpotsFeatures }
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

                let mySpots = []

                //TODO only pilots friends
                if (ctx.query) {
                    //FRIENDS SPOTS
                    //////// FRIEND SPOT LOGIC TO STORE ELSEWHERE
                    if (ctx.query.friends) {
                        const friendsSpots = await strapi.services.spot.getFriendsSpots(profile, ctx.query);
                        mySpots = friendsSpots;
                    }
                    else {
                        //OWN SPOTS
                        let newQuery = ctx.query;
                        newQuery.pilot = pilot.id

                        mySpots = await strapi
                            .query('spot')
                            .find(newQuery);
                    }
                } else {
                    //OWN SPOTS
                    mySpots = await strapi
                        .query('spot')
                        .find({ pilot: pilot.id });
                }

                //TODO OPTIMIZE RETURNED OBJECT
                mySpots = mySpots.map(spot => {
                    const { updated_by, created_by, pilot, ...rest } = spot;
                    if (spot.profile) {
                        const { user, updated_by, ...profile } = spot.profile;
                        rest.profile = profile
                    }

                    return rest
                })

                if (mySpots) return mySpots
            }
            catch (err) {
                console.log(err);
                return ctx.badRequest(
                    null,
                    formatError({
                        id: 'Spot.mine.prohibited',
                        message: "Impossible to find my spots.",
                    })
                );
            }
        }
    },
};

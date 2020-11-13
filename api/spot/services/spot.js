'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    createSpotFeature: (spot) => {

        //A feature is a mapbox feature object
        //Used to display a spot as a marker (feature) on the map
        //https://docs.mapbox.com/help/glossary/features/
        const spotFeature = {
            "type": "Feature",
            "properties": spot,
            "geometry": {
                "coordinates": [spot.longitude, spot.latitude],
                "type": "Point"
            }
        }

        return spotFeature
    },
    getFriendsSpots: async (profile, query) => {

        let friendsSpots = [];

        const followeesPiloteId = await Promise.all(profile.followees.map(async followee => {
            let followeePilot = await strapi.query('pilot').findOne({ profile: followee.id })
            const followeeProfile = await strapi.query('profile').findOne({ id: followee.id })

            return { id: followeePilot.id, profile: followeeProfile }
        }))

        //Removing the ?friends=true query
        let { friends, ...queryWithoutFriend } = query;
        let newQuery = queryWithoutFriend;
        newQuery.privacy = 'friends';

        await Promise.all(followeesPiloteId.map(async followeePilot => {
            newQuery.pilot = followeePilot.id
            let followeeSpots = await strapi.query('spot').find(newQuery)

            // And now we're pushing each friends spots to a global array
            followeeSpots.forEach(spot => {
                spot.profile = followeePilot.profile
                friendsSpots.push(spot);
            })
        }))

        return friendsSpots
    },
    isMyFriendSpot: async (spot, profile) => {

        //Can't get a friends private spots
        if (spot.privacy === 'private') return -1

        return profile.followees.findIndex(followee => followee.id === spot.pilot.profile)
    }
};

'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    getProfileType: async (profile) => {
        const role = await strapi
            .query('role', 'users-permissions')
            .findOne({ id: profile.user.role }, []);

        let profileType = null;

        //We're now getting the pilot or brand profile type according to user role
        if (role) {
            if (role.type === "pilot") {
                profileType = await strapi.api.pilot.services.pilot.findOne({ profile: profile.id })
                profileType.pilot_id = profileType.id
            } else if (role.type === "brand") {
                profileType = await strapi.api.brand.services.brand.findOne({ profile: profile.id })
                profileType.brand_id = profileType.id
            }
        }

        return profileType;
    },
    toggleFollow: async (requestProfile, followProfile) => {
        //If the profile is already followed, then we unfollow it
        const isAlreadyFollow = !!requestProfile.followees.find(followee => followee.id === followProfile.id)

        let newFollowees = requestProfile.followees
        let newFollowers = followProfile.followers

        //Unfollow him by removing the followprofile to the request profile followers list
        if (isAlreadyFollow) {
            newFollowees = newFollowees.filter(followee => followee.id !== followProfile.id)
            newFollowers = newFollowers.filter(follower => follower.id !== requestProfile.id)
        } else {
            //Follow him by adding the followprofile to the request profile followers list
            newFollowees.push(followProfile)
            newFollowers.push(requestProfile)
        }

        const requestProfileUpdated = await strapi.query('profile').update({ id: requestProfile.id }, { followees: newFollowees })
        const followProfileUpdated = await strapi.query('profile').update({ id: followProfile.id }, { followers: newFollowers })

        if (requestProfileUpdated, followProfileUpdated) return true
        else throw("can't update profiles")
    }
};

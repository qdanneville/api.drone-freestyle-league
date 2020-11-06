module.exports = {
    find: async (ctx) => {
        let profile = null;
        let profiles = [];

        if (ctx.url.includes('?user')) {
            profile = await strapi.api.profile.services.profile.findOne(ctx.query);
        } else {
            profiles = await strapi.api.profile.services.profile.find(ctx.query);
        }

        //The purpose of this is to get a profile Type when a user is trying to find a profile with a matching user
        if (profile) {
            const role = await strapi
                .query('role', 'users-permissions')
                .findOne({ id: profile.user.role }, []);

            //We're now getting the pilot or brand profile type according to user role
            if (role) {
                let profileType = null;

                if (role.type === "pilot") {
                    profileType = await strapi.api.pilot.services.pilot.findOne({ profile: profile.id })
                    profileType.pilot_id = profileType.id
                } else if (role.type === "brand") {
                    profileType = await strapi.api.brand.services.brand.findOne({ profile: profile.id })
                    profileType.brand_id = profileType.id
                }

                if (profileType) return profileType;
            }

            return profile;
        }

        return profiles;
    }
};

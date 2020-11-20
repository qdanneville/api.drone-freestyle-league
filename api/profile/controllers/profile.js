const formatError = error => [
    { messages: [{ id: error.id, message: error.message, field: error.field }] },
];

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
    },
    updateUserAccount: async (ctx) => {
        if (ctx.request && ctx.request.header && ctx.request.header.authorization) {

            const { id } = await strapi.plugins[
                'users-permissions'
            ].services.jwt.getToken(ctx);

            const user = await strapi.query('user', 'users-permissions').findOne({ id: ctx.params.id });

            //If the token user isn't the update user
            if (user.id !== id) {
                return ctx.unauthorized(`You can't update this entry`);
            }

            const { currentPassword, profile, ...userParams } = ctx.request.body

            //If a user wants to change his password, he must validate his current password
            if (currentPassword) {
                const validPassword = await strapi.plugins[
                    'users-permissions'
                ].services.user.validatePassword(currentPassword, user.password);

                if (!validPassword) {
                    return ctx.badRequest(
                        null,
                        formatError({
                            id: 'Auth.form.error.invalid',
                            message: 'Current password invalid',
                        })
                    );
                }
            }

            if (userParams.password) userParams.password = await strapi.plugins['users-permissions'].services.user.hashPassword(userParams);

            let profileUpdated = null
            if (profile) profileUpdated = await strapi.query('profile').update({ id: profile.id }, profile);

            let userUpdated = await strapi.query('user', 'users-permissions').update({ id: ctx.params.id }, userParams);

            return { profileId: profileUpdated.id, userId: userUpdated.id }
        }
    },
    update: async ctx => {
        if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
            const { id } = await strapi.plugins[
                'users-permissions'
            ].services.jwt.getToken(ctx);

            const profile = await strapi.query('profile').findOne({ id: ctx.params.id })

            if (profile.user.id !== id) {
                return ctx.unauthorized(`You can't update this entry`);
            }

            body = ctx.request.body;

            return await strapi.services.profile.update({ id: ctx.params.id }, body);
        }
    },
    findOneBySlug: async ctx => {
        if (ctx.request && ctx.request.header && ctx.request.header.authorization) {

            const { slug } = ctx.params;
            const profile = await strapi.query('profile').findOne({ slug: slug })
            const profiles = await strapi.query('profile').find({})
            console.log('PROFILE', profile)
            console.log('PROFILES', profiles)


            if (!profile) {
                return ctx.unauthorized(`Can't find this profile`);
            }

            if (profile && profile.private) {
                return ctx.unauthorized(`This profile is private`);
            }

            const profileType = await strapi.api.profile.services.profile.getProfileType(profile);

            if (profileType) {
                profile.type = profileType
            }

            return profile
        }
    },
    toggleFollow: async ctx => {
        if (ctx.request && ctx.request.header && ctx.request.header.authorization) {

            const { id } = await strapi.plugins[
                'users-permissions'
            ].services.jwt.getToken(ctx);

            const requestProfile = await strapi.query('profile').findOne({ user: id })

            const { slug } = ctx.params
            const followProfile = await strapi.query('profile').findOne({ slug: slug })

            if (!requestProfile) {
                return ctx.unauthorized(`Unauthorized`);
            }

            if (!followProfile) {
                return ctx.badRequest(`Can't find the profile`);
            }

            return await strapi.services.profile.toggleFollow(requestProfile, followProfile);
        }
    },
    getProfileFollowers: async ctx => {
        const { slug } = ctx.params;
        const profile = await strapi.query('profile').findOne({ slug: slug })

        if (!profile) {
            return ctx.unauthorized(`Can't find this profile`);
        }

        if (ctx.query.count) {
            return profile.followers.length
        }

        return profile.followers
    },
    getProfileFollowees: async ctx => {
        const { slug } = ctx.params;
        const profile = await strapi.query('profile').findOne({ slug: slug })

        if (!profile) {
            return ctx.unauthorized(`Can't find this profile`);
        }

        if (ctx.query.count) {
            return profile.followees.length
        }

        return profile.followees
    }

};
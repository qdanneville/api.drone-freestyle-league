'use strict';
//A pilot is level 1 when he starts
//And has 0 experience (current_points)
module.exports = {
    lifecycles: {
        async beforeCreate(data) {
            const date = Date.now();
            data.date = date;

            //Toggle like
            const alreadyExist = await strapi.query('profile-likes-spot').findOne({ profile: data.profile, spot: data.spot })

            if (alreadyExist) {
                data.liked = true
            }
        },
        async afterCreate(data, attrs) {
            //If an instance is already liked, we must delete it
            if (attrs.liked) {
                return await strapi.query('profile-likes-spot').delete({ profile: attrs.profile, spot: attrs.spot })
            }
        }
    }
};

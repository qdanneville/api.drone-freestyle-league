'use strict';

const slugify = require('slugify');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
    lifecycles: {
        async beforeUpdate(data, attrs) {
            const profile = await strapi.query('profile').findOne({ user: attrs.id })

            if (profile) {
                const profileSlug = slugify(attrs.username);
                await strapi.query('profile').update({ id: profile.id }, { slug: profileSlug })
            }
        }
    },
};

'use strict';


const slugify = require('slugify');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
    lifecycles: {
        async beforeCreate(data) {
            if (data.user && data.user.username) data.slug = slugify(data.user.username);
        }
    },
};

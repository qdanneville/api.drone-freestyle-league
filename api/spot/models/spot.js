'use strict';


const slugify = require('slugify');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
    lifecycles: {
        async beforeCreate(data) {
            if (data.name) data.slug = slugify(data.name);
        },
        async beforeUpdate(data, attrs) {
            if (attrs.name) attrs.slug = slugify(attrs.name);
        },
    },
};

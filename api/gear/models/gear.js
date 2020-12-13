'use strict';

const slugify = require('slugify');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

// TODO PUT A UUID
module.exports = {
    lifecycles: {
        async afterCreate(data) {
            if (data.name) data.slug = slugify(data.name + '-' + data.id);
            await strapi.query('gear').update({ id: data.id }, { slug: data.slug })
        },
        async beforeUpdate(data, attrs) {
            if (attrs && attrs.name && data && data.id) attrs.slug = slugify(attrs.name + '-' + data.id);
        },
    },
};

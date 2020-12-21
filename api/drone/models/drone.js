'use strict';

const slugify = require('slugify');
const axios = require('axios');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

// TODO PUT A UUID
module.exports = {
    lifecycles: {
        async afterCreate(data) {
            if (data.name) data.slug = slugify(data.name + '-' + data.id);
            await strapi.query('drone').update({ id: data.id }, { slug: data.slug })
        },
        async beforeCreate(data) {
            const ImageResponse = await axios.get('http://localhost:1337/upload/files?name=default-drone-image')
            if (ImageResponse && ImageResponse.data) data.image = ImageResponse.data
        },
        async beforeUpdate(data, attrs) {
            if (attrs && attrs.name && data && data.id) attrs.slug = slugify(attrs.name + '-' + data.id);
        },
    },
};

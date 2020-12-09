'use strict';


const slugify = require('slugify');
const axios = require('axios');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
    lifecycles: {
        async beforeCreate(data) {
            if (data.name) data.slug = slugify(data.name);
            const ImageResponse = await axios.get('http://localhost:1337/upload/files?name=default-spot-image')
            if (ImageResponse && ImageResponse.data) data.image = ImageResponse.data
        },
        async beforeUpdate(data, attrs) {
            if (attrs.name) attrs.slug = slugify(attrs.name);
        },
    },
};

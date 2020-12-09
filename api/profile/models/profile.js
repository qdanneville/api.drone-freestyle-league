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
            if (data.user && data.user.username) data.slug = slugify(data.user.username);
            const ImageResponse = await axios.get('http://localhost:1337/upload/files?name=default-profile-image')
            if (ImageResponse && ImageResponse.data) data.avatar = ImageResponse.data
        }
    },
};

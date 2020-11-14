'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

const axios = require('axios');
const AIRMAP_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVkZW50aWFsX2lkIjoiY3JlZGVudGlhbHxQZFJwd0c3aU5SZ0s5Z2gwNE14UDNzd3c4OFA0IiwiYXBwbGljYXRpb25faWQiOiJhcHBsaWNhdGlvbnxkNmUwQTN3dU9uTTY2S2N2UTNncDZDYkU5NzgiLCJvcmdhbml6YXRpb25faWQiOiJkZXZlbG9wZXJ8YVB4OU5kS2N2RHF2UTd0OW9FWTM1aU54ZEo3YSIsImlhdCI6MTYwMjA4ODk0Mn0.lyKxwdx8t6a7Jt2A2YL07FGicddXNWdbhcX_d94pEyk"

module.exports = {
    getRules: async (lng, lat) => {
        const result = await axios.post(`https://api.airmap.com/rules/v1/`, {
            geometry: {
                type: "Point",
                coordinates: [lng, lat]
            }
        }, {
            headers: {
                "x-api-key": AIRMAP_ACCESS_TOKEN
            }
        })

        const rules = result.data.data

        if (rules) return rules
        else throw true
    },
    getAdvisories: async (lng, lat, ruleId) => {
        const result = await axios.post(`https://api.airmap.com/advisory/v2/airspace`, {
            geometry: {
                type: "Point",
                coordinates: [lng, lat]
            },
            rulesets: ruleId
        }, {
            headers: {
                "x-api-key": AIRMAP_ACCESS_TOKEN
            }
        })

        const advisories = result.data.data

        if (advisories) return advisories
        else throw true
    }
};

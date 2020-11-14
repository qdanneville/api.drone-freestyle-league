'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    find: async (ctx) => {

        let { lng, lat } = ctx.query

        if (lng && lat) {

            lng = parseFloat(lng)
            lat = parseFloat(lat)

            const rules = await strapi.services.airspace.getRules(lng, lat)
            // console.log('ALL RULES', rules);

            //WE might wanna optimize this, we're getting all required rules & the default one
            //In order to generate advitories
            let requiredRules = rules.filter(rule => rule.selection_type === 'required' || rule.default)
            requiredRules = requiredRules.map(rule => rule.id)
            requiredRules = requiredRules.join()

            const advisories = await strapi.services.airspace.getAdvisories(lng, lat, requiredRules)

            if (advisories) return advisories
        }
    }
};

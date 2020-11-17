'use strict';
//A pilot is level 1 when he starts
//And has 0 experience (current_points)
module.exports = {
    lifecycles: {
        async beforeCreate(data) {
            const defaultLevel = await strapi.query('level').findOne({ number: 1 })
            if (defaultLevel) data.level = defaultLevel
            data.current_points = 0.00;
        }
    }
};

'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    createSpotFeature: (spot) => {

        //A feature is a mapbox feature object
        //Used to display a spot as a marker (feature) on the map
        //https://docs.mapbox.com/help/glossary/features/
        const spotFeature = {
            "type": "Feature",
            "properties": spot,
            "geometry": {
                "coordinates": [spot.longitude, spot.latitude],
                "type": "Point"
            }
        }

        return spotFeature
    }
};

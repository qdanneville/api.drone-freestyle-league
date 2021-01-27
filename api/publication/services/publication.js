'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    async find(params, populate) {

        let publications = await strapi.query('publication').find(params, populate);

        let newPublications = []

        newPublications = await Promise.all(publications.map(async publication => {
            let items = publication.publication_items
            let newItems = []

            //TODO Filter by created_at
            if (items) {
                newItems = await Promise.all(items.map(async item => {
                    // console.log('item', item)
                    let itemCategory = item.category

                    //Custom shit, an enum strapi item can't be like 'drone-part'
                    if (itemCategory === 'drone_part') itemCategory = 'drone-part'

                    //Now we need to transform the category into a publication_item_category
                    if (itemCategory) itemCategory = 'publication-item-' + itemCategory

                    let newItem = await strapi.query(itemCategory).findOne({ publication_item: item.id })
                    const keys = Object.keys(newItem);
                    console.log(keys)
                    newItem.item = newItem[keys[2]];
                    delete newItem[keys[2]]

                    console.log(newItem);

                    // newItem.replace(item.category, 'item')
                    if (newItem) return newItem
                }))
            }

            publication.publication_items = newItems;
            return publication
        }))

        return newPublications
    },
};

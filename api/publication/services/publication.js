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

                    let manufacturerPopulate = item.category + '.manufacturer'
                    let typePopulate = item.category + '.type'
                    let imagePopulate = item.category + '.image'

                    if (item.category === 'spot') typePopulate = item.category + '.spot_type';
                    if (item.category === 'profile') imagePopulate = item.category + '.avatar';

                    let newItem = await strapi.query(itemCategory).findOne({ publication_item: item.id }, [manufacturerPopulate, typePopulate, imagePopulate])
                    const keys = Object.keys(newItem);
                    newItem.item = newItem[keys[2]];
                    delete newItem[keys[2]]
                    // newItem.replace(item.category, 'item')
                    newItem.itemType = item.category

                    if (newItem) return newItem
                }))
            }

            publication.publication_items = newItems;
            return publication
        }))

        return newPublications
    },
};

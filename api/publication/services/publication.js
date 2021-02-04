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
    async createPublicationItems(items, publicationId) {
        //For each items, we have to create a publication item and add it the the created publication
        const publicationItems = await Promise.all(items.map(async item => {

            let publicationItemEntity;

            publicationItemEntity = await strapi.query('publication-item').create({ category: item.type, publication: publicationId })

            let publicationSpecificItemEntity;

            switch (item.type) {
                case 'drone':
                    publicationSpecificItemEntity = await strapi.query('publication-item-drone').create({ publication_item: publicationItemEntity.id, drone: item.id })
                case 'gear':
                    publicationSpecificItemEntity = await strapi.query('publication-item-gear').create({ publication_item: publicationItemEntity.id, gear: item.id })
                case 'battery':
                    publicationSpecificItemEntity = await strapi.query('publication-item-battery').create({ publication_item: publicationItemEntity.id, battery: item.id })
                case 'drone_part':
                    publicationSpecificItemEntity = await strapi.query('publication-item-drone-part').create({ publication_item: publicationItemEntity.id, drone_part: item.id })
                case 'profile':
                    publicationSpecificItemEntity = await strapi.query('publication-item-profile').create({ publication_item: publicationItemEntity.id, profile: item.id })
                case 'spot':
                    publicationSpecificItemEntity = await strapi.query('publication-item-spot').create({ publication_item: publicationItemEntity.id, spot: item.id })
            }

            if (item.type === 'drone') publicationSpecificItemEntity = await strapi.query('publication-item-drone').create({ publication_item: publicationItemEntity.id, drone: item.id })
            else if (item.type === 'gear') publicationSpecificItemEntity = await strapi.query('publication-item-gear').create({ publication_item: publicationItemEntity.id, gear: item.id })
            else if (item.type === 'battery') publicationSpecificItemEntity = await strapi.query('publication-item-battery').create({ publication_item: publicationItemEntity.id, battery: item.id })
            else if (item.type === 'drone_part') publicationSpecificItemEntity = await strapi.query('publication-item-drone-part').create({ publication_item: publicationItemEntity.id, drone_part: item.id })
            else if (item.type === 'profile') publicationSpecificItemEntity = await strapi.query('publication-item-profile').create({ publication_item: publicationItemEntity.id, profile: item.id })
            else if (item.type === 'spot') publicationSpecificItemEntity = await strapi.query('publication-item-spot').create({ publication_item: publicationItemEntity.id, spot: item.id })

            return { id: publicationItemEntity.id }
        }))

        return publicationItems;
    },
    async resetPublicationItems(publicationId) {
        return await strapi.query('publication-item').delete({ publication: publicationId })
    }
};

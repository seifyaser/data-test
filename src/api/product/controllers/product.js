'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::product.product', ({ strapi }) => ({

  async find(ctx) {
    strapi.log.info('✅ custom product.find running (safe cleaner)');
    const response = await super.find(ctx);

    // نحذف الحقول فقط من المستوى الأساسي
    if (response && Array.isArray(response.data)) {
      response.data = response.data.map(item => {
        if (item?.attributes) {
          // نحذف الثلاث مفاتيح بس
          delete item.attributes.createdAt;
          delete item.attributes.updatedAt;
          delete item.attributes.publishedAt;
        }
        return item;
      });
    }

    return response;
  },

  async findOne(ctx) {
    strapi.log.info('✅ custom product.findOne running (safe cleaner)');
    const response = await super.findOne(ctx);

    if (response?.data?.attributes) {
      delete response.data.attributes.createdAt;
      delete response.data.attributes.updatedAt;
      delete response.data.attributes.publishedAt;
    }

    return response;
  },

}));

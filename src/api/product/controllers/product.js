'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

/**
 * Product controller — strips timestamps before sending to client
 */
module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  // override find (GET /api/products)
  async find(ctx) {
    const res = await super.find(ctx);

    // helper to remove timestamps in-place for response shape
    function stripTimestamps(obj) {
      if (!obj) return obj;

      // if obj is entity with attributes (Strapi v4 shape)
      if (obj.attributes && typeof obj.attributes === 'object') {
        delete obj.attributes.createdAt;
        delete obj.attributes.updatedAt;
        delete obj.attributes.publishedAt;
      }

      // support nested arrays / objects
      if (Array.isArray(obj.data)) {
        obj.data.forEach(item => stripTimestamps(item));
      }

      return obj;
    }

    stripTimestamps(res);
    return res;
  },

  // override findOne (GET /api/products/:id)
  async findOne(ctx) {
    const res = await super.findOne(ctx);
    function stripTimestamps(obj) {
      if (!obj) return obj;
      if (obj.data && obj.data.attributes) {
        delete obj.data.attributes.createdAt;
        delete obj.data.attributes.updatedAt;
        delete obj.data.attributes.publishedAt;
      } else if (obj.attributes) {
        delete obj.attributes.createdAt;
        delete obj.attributes.updatedAt;
        delete obj.attributes.publishedAt;
      }
      return obj;
    }
    stripTimestamps(res);
    return res;
  }
}));

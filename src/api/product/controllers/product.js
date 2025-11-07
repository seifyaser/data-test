'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

function pickProductShape(entity) {
  // entity: { id, attributes: { ... } }
  const attrs = entity.attributes || {};
  const id = entity.id;

  const brandData = attrs.brand?.data?.attributes
    ? { id: attrs.brand.data.id, name: attrs.brand.data.attributes.name, slug: attrs.brand.data.attributes.slug }
    : null;

  const categoryData = attrs.category?.data?.attributes
    ? { id: attrs.category.data.id, name: attrs.category.data.attributes.name, slug: attrs.category.data.attributes.slug }
    : null;

  const images = (attrs.images?.data || []).map(i => {
    const a = i.attributes || {};
    return a.url || a.formats?.thumbnail?.url || a.formats?.small?.url || null;
  }).filter(Boolean);

  return {
    id,
    attributes: {
      name: attrs.name ?? attrs.title ?? null,
      slug: attrs.slug ?? null,
      price: attrs.price ?? null,
      description: attrs.description ?? null,
      brand: brandData,
      category: categoryData,
      images
    }
  };
}

module.exports = createCoreController('api::product.product', ({ strapi }) => ({

  // override find
  async find(ctx) {
    strapi.log.info('✅ custom product.find (rebuild response) running');
    const original = await super.find(ctx);
    const data = Array.isArray(original.data) ? original.data : (original.data ? [original.data] : []);
    const newData = data.map(pickProductShape);
    return { data: newData, meta: original.meta || {} };
  },

  // override findOne
  async findOne(ctx) {
    strapi.log.info('✅ custom product.findOne (rebuild response) running');
    const original = await super.findOne(ctx);
    if (!original || !original.data) return original;
    const newItem = pickProductShape(original.data);
    return { data: newItem, meta: original.meta || {} };
  },

}));

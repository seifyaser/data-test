'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

// الحقول اللي عايزين نمسحها
const KEYS = ['createdAt', 'updatedAt', 'publishedAt'];

// دالة تنظيف آمنة تمر بعمق لكن من غير ما تمسح قيم
function cleanTimestamps(obj) {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    obj.forEach(cleanTimestamps);
    return;
  }

  // لو في attributes نحذف منها الثلاث مفاتيح
  if (obj.attributes && typeof obj.attributes === 'object') {
    KEYS.forEach(k => delete obj.attributes[k]);
    Object.values(obj.attributes).forEach(cleanTimestamps);
  }

  // لو في data (علاقات populate)
  if (obj.data) cleanTimestamps(obj.data);

 
  Object.keys(obj).forEach(key => {
    if (KEYS.includes(key)) {
      delete obj[key];
    } else {
      cleanTimestamps(obj[key]);
    }
  });
}

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  async find(ctx) {
    strapi.log.info('✅ Deep Cleaner: product.find running');
    const response = await super.find(ctx);
    cleanTimestamps(response);
    return response;
  },

  async findOne(ctx) {
    strapi.log.info('✅ Deep Cleaner: product.findOne running');
    const response = await super.findOne(ctx);
    cleanTimestamps(response);
    return response;
  },
}));

'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

// المفاتيح اللي عايزين نحذفها
const KEYS = ['createdAt', 'updatedAt', 'publishedAt', 'documentId'];

// دالة تنظيف شاملة تمر على كل الكائنات بعمق
function cleanTimestamps(obj) {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    obj.forEach(cleanTimestamps);
    return;
  }

  // لو في attributes نحذف المفاتيح
  if (obj.attributes && typeof obj.attributes === 'object') {
    KEYS.forEach(k => delete obj.attributes[k]);
    Object.values(obj.attributes).forEach(cleanTimestamps);
  }

  // لو في data (علاقات populate)
  if (obj.data) cleanTimestamps(obj.data);

  // نحذف المفاتيح من المستوى الأعلى كمان لو موجودة
  Object.keys(obj).forEach(key => {
    if (KEYS.includes(key)) {
      delete obj[key];
    } else {
      cleanTimestamps(obj[key]);
    }
  });
}

module.exports = createCoreController('api::about.about', ({ strapi }) => ({

  async find(ctx) {
    strapi.log.info('✅ Deep Cleaner: about.find running');
    const response = await super.find(ctx);
    cleanTimestamps(response);
    return response;
  },

  async findOne(ctx) {
    strapi.log.info('✅ Deep Cleaner: about.findOne running');
    const response = await super.findOne(ctx);
    cleanTimestamps(response);
    return response;
  },

}));

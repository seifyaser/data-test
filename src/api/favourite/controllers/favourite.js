'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::favourite.favourite', ({ strapi }) => ({

  //----------------------------------------------------------------------
  // GET /api/favourites
  // يرجّع جميع المفضلات الخاصة بالمستخدم + بيانات المنتج
  //----------------------------------------------------------------------
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("User not authenticated");

    const data = await strapi.entityService.findMany('api::favourite.favourite', {
      filters: { user: user.id },
      populate: { favourite_product: true }, // ← رجّع بيانات المنتج كاملة
    });

    return this.transformResponse(data);
  },

  //----------------------------------------------------------------------
  // POST /api/favourites
  // إضافة منتج للمفضلة — باستخدام user من الـ JWT فقط
  //----------------------------------------------------------------------
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("User not authenticated");

    const productId = ctx.request.body.data?.favourite_product;
    if (!productId) return ctx.badRequest("Product ID is required");

    // تحقق إن المنتج مش مضاف قبل كده
    const exists = await strapi.entityService.findMany('api::favourite.favourite', {
      filters: {
        user: user.id,
        favourite_product: productId,
      },
    });

    if (exists.length > 0) {
      // موجود قبل كده → رجّعه
      return this.transformResponse(exists[0]);
    }

    // إنشاء المفضلة
    const entry = await strapi.entityService.create('api::favourite.favourite', {
      data: {
        user: user.id,
        favourite_product: productId,
      },
      populate: { favourite_product: true }, // ← رجّع المنتج في الـ response
    });

    return this.transformResponse(entry);
  },

  //----------------------------------------------------------------------
  // DELETE /api/favourites/:id
  // حذف المفضلة — مع التأكد إنها تخص نفس المستخدم
  //----------------------------------------------------------------------
  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("User not authenticated");

    const id = ctx.params.id;

    const fav = await strapi.entityService.findOne('api::favourite.favourite', id, {
      populate: { user: true },
    });

    if (!fav) return ctx.notFound("Favourite not found");
    if (fav.user.id !== user.id) return ctx.unauthorized("Not allowed to delete this item");

    await strapi.entityService.delete('api::favourite.favourite', id);

    return { deleted: true };
  },

}));

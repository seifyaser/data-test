'use strict';

/*
نربط الـ favorite بالمستخدم من الـ JWT فقط

نمنع تكرار إلا لو المستخدم أضاف نفس المنتج قبل كده

نرجّع بيانات المنتج مع الـ favorite باستخدام populate

نسهّل على الـ Frontend التعامل بدون ما يرسل userId
*/
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::favourite.favourite', ({ strapi }) => ({

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const data = await strapi.entityService.findMany('api::favourite.favourite', {
      filters: { users_permissions_user: user.id },
      populate: { favourite_product: true },
    });

    return this.transformResponse(data);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const productId = ctx.request.body.data?.favourite_product;
    if (!productId) return ctx.badRequest("Product ID is required");

    const exists = await strapi.entityService.findMany('api::favourite.favourite', {
      filters: {
        users_permissions_user: user.id,
        favourite_product: productId,
      },
    });

    if (exists.length > 0) {
      return this.transformResponse(exists[0]);
    }

    const entry = await strapi.entityService.create('api::favourite.favourite', {
      data: {
        users_permissions_user: user.id,
        favourite_product: productId,
      },
    });

    return this.transformResponse(entry);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const id = ctx.params.id;

    const fav = await strapi.entityService.findOne('api::favourite.favourite', id, {
      populate: { users_permissions_user: true }
    });

    if (!fav) return ctx.notFound();
    if (fav.users_permissions_user.id !== user.id) return ctx.unauthorized();

    await strapi.entityService.delete('api::favourite.favourite', id);

    return { deleted: true };
  },
}));

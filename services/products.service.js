const ProductsRepository = require('./../repositories/products.repository');
const LikessRepository = require('./../repositories/like.repository');
const { Products, Users, Users_info, Likes, sequelize } = require('../models/');
const { Transaction } = require("sequelize");

class ProductsService {
  productsRepository = new ProductsRepository(Products, Users, Users_info);
  likesRepository = new LikessRepository(Likes);

  createProduct = async (
    user_id,
    id,
    title,
    content,
    price,
    category,
    photo_ip
  ) => {
    await this.productsRepository.createProduct(
      user_id,
      id,
      title,
      content,
      price,
      category,
      photo_ip
    );
  };

  findAllProducts = async () => {
    const products = await this.productsRepository.findAllProducts();

    return products.map((product) => {
      return {
        product_id: product.product_id,
        title: product.title,
        address: product.Users_info.address,
        price: product.price,
        category: product.category,
        likes: product.likes,
        views: product.views,
        createdAt: product.createdAt,
        is_sold: product.is_sold,
        photo_ip: product.photo_ip,
      };
    });
  };

  findDetailProduct = async (token, product_id) => {
    try {
      const t = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
      });

      const product = await this.productsRepository.findDetailProduct(
        product_id,
        t
      );
      if (!product) {
        const error = new Error();
        error.errorCode = 404;
        error.message = "상품이 존재하지 않습니다.";
        throw error;
      }

      let check = false;
      if (token) {
        const nickname = token.nickname;
        const user = await Users.findOne({
          where: { nickname },
          attributes: ['user_id']
        });
        const user_id = user.user_id;
        const like = await this.likesRepository.existLikeId(user_id, product_id, t);
        
        if (like) {
          check = true;
        }
      }
      
      const category = product.category;
      const relatedProduct = await this.productsRepository.findRelatedProduct(
        category,
        product_id,
        t
      );

      await this.productsRepository.hitsProduct(product_id, t);

      await t.commit();

      return {
        product_id: product.product_id,
        id: product.User.id,
        title: product.title,
        content: product.content,
        address: product.Users_info.address,
        price: product.price,
        category: product.category,
        chat_count: product.chat_count,
        existLike: check,
        likes: product.likes,
        views: product.views + 1,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        is_sold: product.is_sold,
        photo_ip: product.photo_ip,
        relatedProduct: relatedProduct,
      };
    } catch (error) {
      throw new Error(error);
    }
  };

  updateProduct = async (
    product_id,
    user_id,
    id,
    title,
    content,
    price,
    category,
    photo_ip
  ) => {
    try {
      const t = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
      });

      const product = await this.productsRepository.findDetailProduct(
        product_id,
        t
      );
      if (!product) {
        const error = new Error();
        error.errorCode = 404;
        error.message = "상품이 존재하지 않습니다.";
        throw error;
      }
      if (product.user_id !== user_id) {
        const error = new Error();
        error.errorCode = 403;
        error.message = "상품 수정 권한이 존재하지 않습니다.";
        throw error;
      }
      await this.productsRepository.updateProduct(
        product_id,
        title,
        content,
        price,
        category,
        photo_ip,
        t
      );

      const updateProduct = await this.productsRepository.findDetailProduct(
        product_id,
        t
      );

      await t.commit();

      return {
        product_id: updateProduct.product_id,
        user_id: updateProduct.user_id,
        title: updateProduct.title,
        content: updateProduct.content,
        price: updateProduct.price,
        photo_ip: updateProduct.photo_ip,
      };
    } catch (error) {
      throw new Error(error);
    }
  };

  deleteProduct = async (product_id, user_id, id) => {
    try {
      const t = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
      });

      const product = await this.productsRepository.findDetailProduct(
        product_id,
        t
      );
      if (!product) {
        const error = new Error();
        error.errorCode = 404;
        error.message = "상품이 존재하지 않습니다.";
        throw error;
      }
      if (product.user_id !== user_id) {
        const error = new Error();
        error.errorCode = 403;
        error.message = "상품 삭제 권한이 없습니다.";
        throw error;
      }

      await this.productsRepository.deleteProduct(product_id, t);

      await t.commit();
    } catch (error) {
      throw new Error(error);
    }
  };

  makeProductSold = async (product_id, user_id) => {
    try {
      const t = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
      });

      const product = await this.productsRepository.findDetailProduct(
        product_id,
        t
      );
      if (!product) {
        const error = new Error();
        error.errorCode = 404;
        error.message = "상품이 존재하지 않습니다.";
        throw error;
      }
      if (product.user_id !== user_id) {
        const error = new Error();
        error.errorCode = 403;
        error.message = "상품 수정 권한이 존재하지 않습니다.";
        throw error;
      }
      await this.productsRepository.makeProductSold(product_id, t);

      await t.commit();
    } catch (error) {
      throw new Error(error);
    }
  };

  searchProduct = async (keyword) => {
    const keywords = keyword.split(" ");

    const result = await this.productsRepository.searchProduct(keywords);

    return result.map((product) => {
      return {
        product_id: product.product_id,
        title: product.title,
        address: product.Users_info.address,
        price: product.price,
        category: product.category,
        likes: product.likes,
        views: product.views,
        createdAt: product.createdAt,
        is_sold: product.is_sold,
        photo_ip: product.photo_ip,
      };
    });
  };

  getRegionProduct = async (region) => {
    const result = await this.productsRepository.getRegionProduct(region);

    return result.map((product) => {
      return {
        product_id: product.product_id,
        title: product.title,
        address: product.Users_info.address,
        price: product.price,
        category: product.category,
        likes: product.likes,
        views: product.views,
        createdAt: product.createdAt,
        is_sold: product.is_sold,
        photo_ip: product.photo_ip,
      };
    });
  };
}

module.exports = ProductsService;

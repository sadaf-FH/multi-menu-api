import { models } from '../models';
import { Transaction } from 'sequelize';
import { Category } from '../models/Category';

export const CategoryRepository = {
  create(data: any, transaction?: Transaction) {
    return models.Category.create(data, { transaction });
  },
  bulkCreate(data: any[], transaction?: Transaction) {
    return Category.bulkCreate(data, {
      transaction,
      returning: true, 
    });
  }
};

export const ItemRepository = {
  create(data: any, transaction?: Transaction) {
    return models.Item.create(data, { transaction });
  },
  bulkCreate(data: any[], transaction?: Transaction) {
    return models.Item.bulkCreate(data, {
      transaction,
      returning: true,
    });
  },
};

export const ItemPriceRepository = {
  bulkCreate(data: any[], transaction?: Transaction) {
    return models.ItemPrice.bulkCreate(data, { transaction });
  },
};

export const AddOnRepository = {
  create(data: any, transaction?: Transaction) {
    return models.AddOn.create(data, { transaction });
  },

  bulkCreate(data: any[], transaction?: Transaction) {
    return models.AddOn.bulkCreate(data, {
      transaction,
      returning: true,
    });
  },
};

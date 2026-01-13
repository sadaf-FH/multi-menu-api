import { models } from '../models';
import { Transaction } from 'sequelize';

export const CategoryRepository = {
  create(data: any, transaction?: Transaction) {
    return models.Category.create(data, { transaction });
  },
};

export const ItemRepository = {
  create(data: any, transaction?: Transaction) {
    return models.Item.create(data, { transaction });
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
};

import { DataTypes, Model, Sequelize } from 'sequelize';
import { OrderType } from '../utils/constants';

export class ItemPrice extends Model {
  declare item_id: string;
  declare order_type: OrderType;
  declare price: number;
}

export function initItemPrice(sequelize: Sequelize) {
  ItemPrice.init(
    {
      item_id: { type: DataTypes.UUID, allowNull: false },
      order_type: {
        type: DataTypes.ENUM('DINE_IN', 'TAKEAWAY'),
        allowNull: false,
      },
      price: { type: DataTypes.FLOAT, allowNull: false },
    },
    {
      sequelize,
      modelName: 'ItemPrice',
      tableName: 'ItemPrices',
      timestamps: true,
    },
  );
  return ItemPrice;
}

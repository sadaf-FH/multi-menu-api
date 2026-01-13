import { DataTypes, Model, Sequelize } from 'sequelize';
import { ItemPrice } from './ItemPrice';
import { AddOn } from './AddOn';

export class Item extends Model {
  declare category_id: string;
  declare item_id: string;
  declare available_from: string | null;
  declare available_to: string | null;
  declare ItemPrices?: ItemPrice[];
  declare AddOn?: AddOn;
}

export function initItem(sequelize: Sequelize) {
  Item.init(
    {
      item_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      category_id: { type: DataTypes.UUID, allowNull: false },
      available_from: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      available_to: {
        type: DataTypes.TIME,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Item',
      tableName: 'Items',
      timestamps: true,
    },
  );
  return Item;
}

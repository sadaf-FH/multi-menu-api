import { DataTypes, Model, Sequelize } from 'sequelize';

export class Item extends Model {
  declare category_id: string;
  declare item_id: string;
  declare time: string;
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
      time: { type: DataTypes.STRING, allowNull: true }, 
    },
    {
      sequelize,
      modelName: 'Item',
      tableName: 'Items',
      timestamps: true,
    }
  );
  return Item;
}

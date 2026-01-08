import { DataTypes, Model, Sequelize } from 'sequelize';

export class Category extends Model {
  declare menu_id: string;
  declare category_id: string;
  declare name: string;
  declare avg_price: number;
  declare item_count: number;
}

export function initCategory(sequelize: Sequelize) {
  Category.init(
    {
      category_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      menu_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      avg_price: { type: DataTypes.FLOAT, defaultValue: 0 },
      item_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'Categories',
      timestamps: true,
    }
  );
  return Category;
}

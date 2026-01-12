import { DataTypes, Model, Sequelize } from 'sequelize';
import { Restaurant } from './Restaurant';

export class Menu extends Model {
  declare menu_id: string;
  declare R_ID: string;
  declare version: number;
}

export function initMenu(sequelize: Sequelize) {
  Menu.init(
    {
      menu_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      R_ID: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      version: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    {
      sequelize,
      modelName: 'Menu',
      tableName: 'Menus',
      timestamps: true,
    },
  );

  // Associations
  Menu.belongsTo(Restaurant, { foreignKey: 'R_ID' });
  return Menu;
}

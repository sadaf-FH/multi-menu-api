import { DataTypes, Model, Sequelize } from 'sequelize';

export class Restaurant extends Model {
  declare R_ID: string;
  declare name: string;
  declare franchise: string | null;
  declare location: string;
  declare available: boolean;
  declare timezone: string;
}

export function initRestaurant(sequelize: Sequelize) {
  Restaurant.init(
    {
      R_ID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      franchise: { type: DataTypes.STRING, allowNull: true },
      location: { type: DataTypes.STRING, allowNull: false },
      available: { type: DataTypes.BOOLEAN, defaultValue: true },
      timezone: { type: DataTypes.STRING, defaultValue: 'UTC' }
    },
    {
      sequelize,
      modelName: 'Restaurant',
      tableName: 'Restaurants',
      timestamps: true,
    }
  );
  return Restaurant;
}

import { DataTypes, Model, Sequelize } from 'sequelize';

export class Offer extends Model {
  declare id: number;
  declare item_id: string | null;
  declare category_id: string | null;
  declare type: 'FLAT' | 'PERCENT';
  declare amount: number;
  declare max_discount: number;
}

export function initOffer(sequelize: Sequelize) {
  Offer.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      item_id: { type: DataTypes.UUID, allowNull: true },
      category_id: { type: DataTypes.UUID, allowNull: true },
      type: {
        type: DataTypes.ENUM('FLAT', 'PERCENT'),
        allowNull: false,
      },
      amount: { type: DataTypes.FLOAT, allowNull: false },
      max_discount: { type: DataTypes.FLOAT, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Offer',
      tableName: 'Offers',
      timestamps: true,
    },
  );
  return Offer;
}

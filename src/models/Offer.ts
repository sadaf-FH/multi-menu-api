import { DataTypes, Model, Sequelize } from 'sequelize';
import { OfferType } from '../utils/constants';

export class Offer extends Model {
  declare id: number;
  declare item_id: string | null;
  declare category_id: string | null;
  declare type: OfferType;
  declare amount: number;
  declare max_discount: number;
  declare available_from: string | null;
  declare available_to: string | null;
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
      modelName: 'Offer',
      tableName: 'Offers',
      timestamps: true,
    },
  );
  return Offer;
}

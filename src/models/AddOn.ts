import { DataTypes, Model, Sequelize } from 'sequelize';

export class AddOn extends Model {
  declare item_id: string;
  declare min_quantity: number;
  declare max_quantity: number;
  declare required: boolean;
}

export function initAddOn(sequelize: Sequelize) {
  AddOn.init(
    {
      item_id: { type: DataTypes.UUID, allowNull: false },
      min_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
      max_quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      required: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: 'AddOn',
      tableName: 'AddOns',
      timestamps: true,
      indexes: [
        { fields: ['item_id'], unique: true },
      ]
    },
  );
  return AddOn;
}

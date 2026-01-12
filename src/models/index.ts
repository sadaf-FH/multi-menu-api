import { Sequelize } from 'sequelize';
import { initRestaurant, Restaurant } from './Restaurant';
import { initMenu, Menu } from './Menu';
import { initCategory, Category } from './Category';
import { initItem, Item } from './Item';
import { initItemPrice, ItemPrice } from './ItemPrice';
import { initAddOn, AddOn } from './AddOn';
import { initOffer, Offer } from './Offer';

export const sequelize = new Sequelize(
  `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  { logging: false }
);

export const models = {
  Restaurant: initRestaurant(sequelize),
  Menu: initMenu(sequelize),
  Category: initCategory(sequelize),
  Item: initItem(sequelize),
  ItemPrice: initItemPrice(sequelize),
  AddOn: initAddOn(sequelize),
  Offer: initOffer(sequelize),
};

models.Menu.belongsTo(models.Restaurant, { foreignKey: 'R_ID' });
models.Category.belongsTo(models.Menu, { foreignKey: 'menu_id' });
models.Item.belongsTo(models.Category, { foreignKey: 'category_id' });
models.ItemPrice.belongsTo(models.Item, { foreignKey: 'item_id' });
models.AddOn.belongsTo(models.Item, { foreignKey: 'item_id' });
models.Offer.belongsTo(models.Item, { foreignKey: 'item_id' });
models.Offer.belongsTo(models.Category, { foreignKey: 'category_id' });

export const syncDB = async () => {
  await sequelize.sync({ force: true });
  console.log('All tables synced!');
};

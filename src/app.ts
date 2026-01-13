import express from 'express';
import menuRoutes from './routes/menu.routes';
import offerRoutes from './routes/offer.routes';
import restaurantRoutes from './routes/restaurant.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();
app.use(express.json());

app.use('/restaurants', restaurantRoutes);
app.use('/menus', menuRoutes);
app.use('/offers', offerRoutes);

app.use(errorHandler);

export default app;

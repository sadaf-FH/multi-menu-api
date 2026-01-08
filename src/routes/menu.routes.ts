import { Router } from "express";
import { createMenu, getMenuByRestaurant } from "../controllers/menu.controller";

const router = Router();

router.post("/", createMenu);
router.get("/restaurant/:id", getMenuByRestaurant);

export default router;

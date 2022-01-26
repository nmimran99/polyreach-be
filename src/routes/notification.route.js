import { Router } from "express";
import {
	getNotifications,
	readNotifications,
} from "../services/notification.service";

const router = Router();

router.get("/", getNotifications);
router.post("/read", readNotifications);

export default router;

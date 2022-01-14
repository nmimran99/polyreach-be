import { Router } from "express";
import {
	getConnections,
	removeConnection,
	addConnection,
} from "../services/connection.service";

const router = Router();

router.get("/", getConnections);
router.post("/add", addConnection);
router.post("/remove", removeConnection);

export default router;

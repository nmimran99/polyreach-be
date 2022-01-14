import { Router } from "express";
import {
	getCallHistory,
	initCallHistoryRow,
	readAll,
} from "../services/callHistory.service";

const router = Router();

router.get("/", getCallHistory);
router.post("/", initCallHistoryRow);
router.post("/readAll", readAll);

export default router;

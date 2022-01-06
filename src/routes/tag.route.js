import { Router } from "express";
import { createTag, getTags } from "../services/tag.service";

const router = Router();

router.post("/", createTag);
router.get("/", getTags);

export default router;

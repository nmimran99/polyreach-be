import { Router } from "express";
import { authenticate, reAuthUser } from "../security/auth";
import { createUser } from "../services/user.service";
import { uploadAvatar } from "../utils/multer";

const router = Router();

router.post("/", uploadAvatar.single("avatar"), createUser);
router.post("/authenticate", authenticate);
router.post("/reauth", reAuthUser);

export default router;

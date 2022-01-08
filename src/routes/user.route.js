import { Router } from "express";
import { authenticate, reAuthUser, verifyUserCode } from "../security/auth";
import {
	checkEmailExists,
	createUser,
	resendVerificationEmail,
	sendPasswordRecoveryEmail,
	resetPassword,
} from "../services/user.service";
import { uploadAvatar } from "../utils/multer";

const router = Router();

router.get("/emailExists", checkEmailExists);
router.post("/", uploadAvatar.single("avatar"), createUser);
router.post("/authenticate", authenticate);
router.post("/reauth", reAuthUser);
router.post("/sendEmailVerification", resendVerificationEmail);
router.post("/verifyUser", verifyUserCode);
router.post("/sendPasswordRecoveryEmail", sendPasswordRecoveryEmail);
router.post("/resetPassword", resetPassword);

export default router;

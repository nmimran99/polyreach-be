import { Router } from "express";
import { authenticate, reAuthUser, verifyUserCode } from "../security/auth";
import {
	checkEmailExists,
	createUser,
	resendVerificationEmail,
	sendPasswordRecoveryEmail,
	resetPassword,
	getActiveUsers,
	updateUserStatus,
	getSocketId,
} from "../services/user.service";
import { uploadAvatar } from "../utils/multer";

const router = Router();

router.get("/emailExists", checkEmailExists);
router.get("/activeUsers", getActiveUsers);
router.get("/getSocketId", getSocketId);

router.post("/", uploadAvatar.single("avatar"), createUser);
router.post("/authenticate", authenticate);
router.post("/reauth", reAuthUser);
router.post("/sendEmailVerification", resendVerificationEmail);
router.post("/verifyUser", verifyUserCode);
router.post("/sendPasswordRecoveryEmail", sendPasswordRecoveryEmail);
router.post("/resetPassword", resetPassword);

router.post("/updateStatus", updateUserStatus);

export default router;

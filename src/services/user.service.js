import bcryptjs from "bcryptjs";
import User from "../models/user.model";
import { uploadFilesToBlob } from "../utils/blobApi";
import sgMail from "@sendgrid/mail";
import {
	generateAccessToken,
	generateVerificationCode,
} from "../security/auth";
import jwt_decode from "jwt-decode";
import jwt from "jsonwebtoken";

sgMail.setApiKey(
	"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"
);

export const checkEmailExists = async (req, res) => {
	try {
		let isEmailExist = await User.findOne({ email: req.query.email });

		if (isEmailExist) {
			res
				.status(400)
				.send({ error: "User with this email already exists in our system." });
			return;
		}
		res.status(200).send(true);
	} catch (e) {
		console.log(e.message);
		res.status(500).send({ message: "system error " });
	}
};

export const createUser = async (req, res) => {
	let avatar = req.file;
	let avatarURL;
	let password = req.body.password;

	try {
		if (avatar) {
			avatarURL = await uploadFilesToBlob([req.file], "users");
		}

		let isEmailExist = await User.findOne({ email: req.body.email });

		if (isEmailExist) {
			res
				.status(400)
				.send({ error: "User with this email already exists in our system." });
			return;
		}

		let salt = await bcryptjs.genSalt(10);
		if (!req.body.password) {
			password = "password";
		}

		const hashedPassword = await bcryptjs.hash(password, salt);

		const user = new User({
			avatar: avatarURL[0] || null,
			email: req.body.email,
			password: hashedPassword,
			info: {
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				location: req.body.location,
			},
			data: {
				company: req.body.company,
				occupation: req.body.occupation,
				interests: JSON.parse(req.body.interests),
				introduction: req.body.introduction,
			},
			status: {
				status: "available",
				maxConversationLength: 0,
			},
			flags: {
				changePasswordOnFirstLogin: true,
				isVerified: false,
			},
		});

		const savedUser = await user.save();
		if (savedUser) {
			const vCode = await generateVerificationCode(savedUser);
			sendConfirmationEmail(user, vCode);
			res.status(201).send({ user: savedUser, token: token });
			return;
		}
		res.status(500).send({ error: "User did not write to database." });
	} catch (e) {
		console.log(e.message);
		res.status(500).send({ error: e.message });
	}
};

export const resendVerificationEmail = async (req, res) => {
	const { userId } = req.body;
	try {
		const user = await User.findOne({ _id: userId });
		const vCode = await generateVerificationCode(user);

		const result = await sendConfirmationEmail(user, vCode);

		if (result) {
			res.status(200).send(true);
			return;
		}
		res.status(400).send({ userId: user._id, message: "Bad requets" });
		return;
	} catch (e) {
		console.log(e.message);
		res.status(500).send({ error: e.message });
	}
};

export const sendConfirmationEmail = async (user, vCode) => {
	try {
		const message = {
			from: "nmimran99@gmail.com",
			to: user.email,
			templateId: "d-f991e60410ba408d858a96de2a4a5f37",
			dynamicTemplateData: {
				first_name: user.info.firstName,
				link: `${process.env.FRONTEND_URL}/auth/${vCode}`,
			},
		};

		await sgMail.send(message);

		return true;
	} catch (e) {
		console.log("email: ", e.message);
		return e;
	}
};

export const sendPasswordRecoveryEmail = async (req, res) => {
	const { email } = req.body;

	const user = await User.findOne({ email });
	if (!user) {
		res.status(200).send({ result: false });
		return;
	}

	const vCode = await generateVerificationCode(user);

	try {
		const message = {
			from: "nmimran99@gmail.com",
			to: user.email,
			subject: "Polyreach - Password Recovery",
			templateId: "d-5605e302621d4f2bb5034cae9dd64bb5",
			dynamicTemplateData: {
				first_name: user.info.firstName,
				link: `${process.env.FRONTEND_URL}/auth/resetpass/${vCode}`,
			},
		};

		await sgMail.send(message);

		res.status(200).send(true);
		return;
	} catch (e) {
		console.log(e.message);
		res.status(200).send(false);
	}
};

export const resetPassword = async (req, res) => {
	const { vCode, password } = req.body;
	let userId, email;

	try {
		const payload = await jwt_decode(vCode);
		userId = payload.userId;
		email = payload.email;
	} catch (e) {
		console.log(e.message);
		res.status(400).send({ verified: false, message: "Token invalid" });
		return;
	}

	let salt = await bcryptjs.genSalt(10);
	const hashedPassword = await bcryptjs.hash(password, salt);

	return jwt.verify(vCode, process.env.JWT_SECRET, async (err) => {
		if (err) {
			if (err.message === "invalid token") {
				res.status(400).send({ result: false, messgae: "invalid token" });
				return;
			}

			if (err.message === "jwt expired") {
				res.status(400).send({ verified: false, messgae: err.message });
				return;
			}
		}

		let savedUser = await User.findOneAndUpdate(
			{ _id: userId },
			{ password: hashedPassword },
			{ useFindOneAndModify: false, new: true }
		);

		if (savedUser) {
			res.status(200).send(true);
			return;
		}

		res.status(500).send(false);
		return;
	});
};

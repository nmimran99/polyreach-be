import bcrypt from "bcryptjs/dist/bcrypt";
import User from "../models/user.model";
import randtoken from "rand-token";
import jwt from "jsonwebtoken";
import jwt_decode from "jwt-decode";

export const authenticate = async (req, res) => {
	let { email } = req.body;
	if (email) {
		email = email.toLowerCase();
	}

	try {
		const user = await User.findOne({ email });
		if (!user) {
			res.status(401).send({ message: "Invalid user or password" });
			return;
		}

		const isPassValid = await bcrypt.compare(req.body.password, user.password);
		if (!isPassValid) {
			res.status(401).send({ message: "Invalid user or password" });
			return;
		}
		const token = await generateAccessToken(user._id);

		res.status(200).send({
			user,
			token,
		});
		console.log(
			`User ${user.info.firstName} ${user.info.lastName} has logged in`
		);
	} catch (e) {
		console.log(e.message);
		res.status(500).send({ message: e.message });
	}
};

export const reAuthUser = async (req, res) => {
	var { token, refreshToken } = req.body;

	if (!token) {
		res.status(400).send({ message: "No token was provided" });
		return;
	}

	let decodedToken;
	try {
		decodedToken = await jwt_decode(token);
	} catch (e) {
		res.status(400).send({ messgae: "Could not decode token" });
	}
	const user = await User.findOne({ _id: decodedToken.id });
	return jwt.verify(token, process.env.JWT_SECRET, async (err) => {
		if (!user) {
			res.status(400).send({ message: "User not linked to token" });
			return;
		}
		if (err) {
			if (err.message === "invalid token") {
				res.status(400).send({ messgae: "invalid token" });
				return;
			}

			const currentTime = new Date() / 1000;
			const timeDifference = currentTime - decodedToken.exp;
			const refreshTokenHash = await bcrypt.compare(
				refreshToken,
				decodedToken.refreshTokenHash
			);

			if (
				err.message === "jwt expired" &&
				timeDifference < 86400 &&
				refreshTokenHash
			) {
				const newToken = await generateAccessToken(decodedToken.id);
				res.status(200).send({
					user: user,
					message: "Refreshed token sent",
					token: newToken,
				});
				return;
			}
			res.status(404).send({ message: "Failed to authenticate token" });
			return;
		}

		res.status(200).send({
			user: user,
			message: "User authenticated successfully",
			token: req.body,
		});
	});
};

export const generateVerificationCode = async (user) => {
	const payload = {
		userId: user._id,
		email: user.email,
		time: new Date(),
	};

	var vCode = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: "24h",
	});

	return vCode;
};

export const verifyUserCode = async (req, res) => {
	const { vCode } = req.body;
	let userId, email;

	try {
		const payload = await jwt_decode(vCode);
		userId = payload.userId;
		email = payload.email;
	} catch (e) {
		res.status(400).send({ verified: false, message: "Token invalid" });
		return;
	}

	return jwt.verify(vCode, process.env.JWT_SECRET, async (err) => {
		if (err) {
			if (err.message === "invalid token") {
				res.status(400).send({ verified: false, messgae: "invalid token" });
				return;
			}

			if (err.message === "jwt expired") {
				res.status(400).send({ verified: false, messgae: err.message });
				return;
			}
		}

		const user = await User.find({ _id: userId, email: email });
		if (!user) {
			res
				.status(401)
				.send({ verified: false, message: "User not linked to Email" });
			return;
		}

		const updatedUser = await User.findOneAndUpdate(
			{ _id: userId },
			{ "flags.isVerified": true },
			{ useFindOneAndModify: false, new: true }
		);
		if (!updatedUser) {
			res
				.status(500)
				.send({ verified: false, message: "Could not update user" });
			return;
		}
		res
			.status(200)
			.send({ verified: true, data: "User verified successfully" });
		return;
	});
};

export const generateAccessToken = async (userId) => {
	const refreshToken = randtoken.uid(256);
	const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
	const payload = {
		id: userId,
		time: new Date(),
		refreshTokenHash: refreshTokenHash,
	};
	var token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: "6h",
	});
	return { token, refreshToken };
};

export const genereateResetPasswordUrl = (userId) => {
	return new Promise((resolve, reject) => {
		if (!userId) {
			reject("User ID was not supplied");
		}
		const payload = {
			id: userId,
		};
		var token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: "5m",
		});
		resolve(`${process.env.FRONTEND_URL}/reset/${token}`);
	});
};

export const signPayload = async (payload) => {
	var token = jwt.sign(payload, process.env.JWT_SECRET);
	return token;
};

export const getTokenPayload = async (token) => {
	try {
		const payload = await jwt_decode(token);
		return payload;
	} catch (e) {
		console.log(e.message);
		return false;
	}
};

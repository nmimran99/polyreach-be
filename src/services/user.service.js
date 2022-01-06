import bcryptjs from "bcryptjs";
import User from "../models/user.model";
import { uploadFilesToBlob } from "../utils/blobApi";

export const createUser = async (req, res) => {
	const avatar = req.file;
	let avatarURL;
	let password;

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
			},
			location: {
				country: req.body.country,
				province: req.body.province,
				state: req.body.state,
				city: req.body.city,
			},
			data: {
				company: req.body.company,
				profession: req.body.profession,
				subjects: req.body.subjects,
				introduction: req.body.introduction,
			},
			status: {
				status: "available",
				maxConversationLength: 0,
			},
			flags: {
				changePasswordOnFirstLogin: true,
			},
		});

		const savedUser = await user.save();
		if (savedUser) {
			res.status(201).send({ user: savedUser });
			return;
		}
		res.status(500).send({ error: "User did not write to database." });
	} catch (e) {
		console.log(e.message);
		res.status(500).send({ error: e.message });
	}
};

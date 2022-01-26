import Connection from "../models/connection.model";

export const addConnection = async (req, res) => {
	const { from, to } = req.body;

	try {
		let updated = await Connection.findOneAndUpdate(
			{ user: from },
			{ $push: { following: to } },
			{ new: true }
		).populate({
			path: "following",
			model: "User",
			select: "email data info status avatar messageSocket videoSocket",
		});

		if (!updated) {
			res.status(500).send({ message: "Could not create connection" });
			return;
		}
		res.status(200).send({ following: updated.following });
	} catch (e) {
		console.log(e.message);
		res.status(500).send({ message: e.message });
	}
};

export const removeConnection = async (req, res) => {
	const { from, to } = req.body;

	try {
		let updated = await Connection.findOneAndUpdate(
			{ user: from },
			{ $pull: { following: to } },
			{ new: true }
		).populate({
			path: "following",
			model: "User",
			select: "email data info status avatar messageSocket videoSocket",
		});

		if (!updated) {
			res.status(500).send({ message: "Could not remove connection" });
			return;
		}
		res.status(200).send({ following: updated.following });
	} catch (e) {
		console.log(e.message);
		res.status(500).send({ message: e.message });
	}
};

export const getConnections = async (req, res) => {
	const { userId, page } = req.query;

	try {
		let connection = await Connection.findOne({ user: userId }).populate({
			path: "following",
			model: "User",
			select: "email data info status avatar messageSocket videoSocket",
		});

		if (!connection) {
			res.status(500).send({ message: "Could not get connections" });
			return;
		}
		res.status(200).send({ following: connection.following });
	} catch (e) {
		console.log(e.message);
		res.status(500).send({ message: e.message });
	}
};

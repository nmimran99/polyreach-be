import Notification from "../models/notification.model";

export const createNotification = async ({
	user,
	actionType,
	actionBy,
	data,
}) => {
	try {
		const notification = new Notification({
			user,
			actionType,
			actionBy,
			data,
			read: false,
		});
		const saved = await notification.save();
		return saved.populate("actionBy");
	} catch (e) {
		console.log(e.message);
		return null;
	}
};

export const getNotifications = async (req, res) => {
	const { userId, page } = req.query;

	try {
		const notifications = await Notification.find({ user: userId })
			.populate("actionBy")
			.sort({ createdAt: -1 })
			.limit(10)
			.skip(page * 10);
		res.status(200).send({ notifications });
		return;
	} catch (e) {
		console.log(e.message);
		res.status(500).send(null);
	}
};

export const readNotifications = async (req, res) => {
	const { userId } = req.body;

	try {
		const updated = await Notification.updateMany(
			{ user: userId },
			{ read: true }
		);
		if (updated) {
			res.status(200).send(true);
			return;
		}
		res.status(200).send(false);
	} catch (e) {
		console.log(e.message);
		res.status(500).send(null);
	}
};

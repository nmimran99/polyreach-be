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
		return await notification.save();
	} catch (e) {
		console.log(e.message);
		return null;
	}
};

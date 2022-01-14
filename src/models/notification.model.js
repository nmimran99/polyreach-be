const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: "User" },
		actionType: String,
		actionBy: { type: Schema.Types.ObjectId, ref: "User" },
		read: Boolean,
		data: {},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Notification", notificationSchema);

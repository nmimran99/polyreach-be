const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		avatar: String,
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
			min: 8,
		},
		info: {
			firstName: { type: String, default: null },
			lastName: { type: String, default: null },
			location: { type: String, default: null },
		},
		data: {
			company: { type: String, default: null },
			occupation: { type: String, default: null },
			interests: { type: [String], default: [] },
			introduction: { type: String, default: null },
		},
		status: {
			status: { type: String, default: "Active" },
			maxConversationLength: { type: Number, default: 0 },
			online: { type: Boolean, default: false },
		},
		flags: {
			changePasswordOnFirstLogin: { type: Boolean, default: false },
			isVerified: Boolean,
		},
		videoSocket: { type: String, default: null },
		messageSocket: { type: String, default: null },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("User", userSchema);

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
		},
		location: {
			country: { type: String, default: null },
			province: { type: String, default: null },
			state: { type: String, default: null },
			city: { type: String, default: null },
		},
		data: {
			company: { type: String, default: null },
			profession: { type: String, default: null },
			subjects: { type: [String], default: [] },
			introduction: { type: String, default: null },
		},
		status: {
			status: { type: String, default: "available" },
			maxConversationLength: { type: Number, default: 0 },
		},
		flags: {
			changePasswordOnFirstLogin: { type: Boolean, default: false },
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("User", userSchema);

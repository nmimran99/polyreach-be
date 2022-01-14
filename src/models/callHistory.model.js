const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const callHistorySchema = new Schema(
	{
		from: { type: Schema.Types.ObjectId, ref: "User" },
		to: { type: Schema.Types.ObjectId, ref: "User" },
		status: String,
		startDate: Date,
		endDate: Date,
		read: Boolean,
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("CallHistory", callHistorySchema);

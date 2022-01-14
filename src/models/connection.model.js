const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const connectionSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: "User" },
		following: [{ type: Schema.Types.ObjectId, ref: "User" }],
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Connection", connectionSchema);

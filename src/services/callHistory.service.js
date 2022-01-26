import { ca } from "date-fns/locale";
import res from "express/lib/response";
import CallHistory from "../models/callHistory.model";

export const initCallHistoryRow = async (req, res) => {
	const { from, to } = req.body;

	try {
		const call = new CallHistory({
			from,
			to,
			status: null,
			startDate: new Date(),
			endDate: null,
			read: false,
		});
		const savedCall = await call.save();
		if (savedCall) {
			res.status(200).send({ call: savedCall });
			return;
		}
		res.status(200).send(null);
	} catch (e) {
		console.log(e.message);
		res.status(500).send(null);
	}
};

export const createCallHistoryRow = async ({
	from,
	to,
	status,
	startDate,
	endDate,
}) => {
	const read = status === "missed" ? false : true;

	try {
		const call = new CallHistory({
			from,
			to,
			status,
			startDate,
			endDate,
			read,
		});

		return await call.save();
	} catch (e) {
		console.log(e.message);
		return null;
	}
};

export const getCallHistory = async (req, res) => {
	try {
		const { userId, page } = req.query;

		const calls = await CallHistory.find({
			$or: [{ from: userId }, { to: userId }],
		})
			.populate([
				{
					path: "to",
					model: "User",
					select: "avatar email info status messageSocket videoSocket",
				},
				{
					path: "from",
					model: "User",
					select: "avatar email info status messageSocket videoSocket",
				},
			])
			.limit(10)
			.skip(10 * page)
			.sort({
				createdAt: -1,
			});

		res.status(200).send({ calls });
		return;
	} catch (e) {
		console.log(e.message);
		res.status(500).send({ message: e.message });
		return;
	}
};

export const updateCallEnded = async (callData) => {
	try {
		const callRow = await CallHistory.findOne({ _id: callData._id });

		if (callRow.endDate) {
			return callRow;
		}

		const updated = await CallHistory.findOneAndUpdate(
			{ _id: callData._id },
			{ endDate: new Date() },
			{ new: true }
		);

		return updated;
	} catch (e) {
		console.log(e.message);
		return;
	}
};

export const updateCallStatus = async (callData, status) => {
	try {
		const updated = await CallHistory.findOneAndUpdate(
			{ _id: callData._id },
			{ status },
			{ new: true }
		);

		return updated;
	} catch (e) {
		console.log(e.message);
		return;
	}
};

export const readAll = async (req, res) => {
	try {
		const { userId } = req.body;
		await CallHistory.updateMany({ to: userId }, { read: true });
		res.status(200).send(true);
	} catch (e) {
		res.status(500).send(false);
	}
};

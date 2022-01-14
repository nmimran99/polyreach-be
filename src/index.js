import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import path from "path";
import { Server } from "socket.io";
import User from "./models/user.model";
import servicesRoutes from "./routes/services.route";
import tagRoutes from "./routes/tag.route";
import userRoutes from "./routes/user.route";
import connectionRoutes from "./routes/connection.route";
import chRoutes from "./routes/callHistory.route";
import {
	createCallHistoryRow,
	updateCallEnded,
	updateCallStatus,
} from "./services/callHistory.service";
import { getUserStatus } from "./services/user.service";
import { getRoomId, getRoomParticipants } from "./utils/generic";
require("dotenv").config();
global.appRoot = path.resolve(__dirname);
global.publicFolder = path.join(process.cwd(), "/public");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(process.cwd() + "/public"));

app.use("/user", userRoutes);
app.use("/tag", tagRoutes);
app.use("/services", servicesRoutes);
app.use("/ch", chRoutes);
app.use("/conn", connectionRoutes);

const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

io.sockets.on("connection", async (socket) => {
	let userIdentifier;

	socket.on("userId", async (userId) => {
		userIdentifier = userId;
		await User.findOneAndUpdate({ _id: userId }, { socketId: socket.id });
		socket.emit("socketid", { socketId: socket.id });
	});

	socket.on("diconnect", async () => {
		await User.findOneAndUpdate({ _id: userIdentifier }, { socketId: null });
		socket.broadcast.emit("userdiconnected", socket.id);
	});

	socket.on(
		"calluser",
		({ to_sid, signalData, from_sid, from_user, callData }) => {
			const roomId = getRoomId([from_sid, to_sid]);
			socket.join(roomId);
			io.to(to_sid).emit("calluser", {
				signal: signalData,
				from_sid,
				to_sid,
				from_user,
				roomId,
				callData,
			});

			socket.emit("callinitiated", { roomId });
		}
	);

	socket.on(
		"nopickup",
		async ({ caller_sid, caller, receiver, receiver_sid, callData }) => {
			await updateCallEnded(callData);
			io.to(caller_sid).emit("noanswer", { receiver });
			socket.emit("callmissed", { caller });
		}
	);

	socket.on("refusedcall", ({ caller, receiver }) => {
		io.to(caller).emit("callrefused", { receiver });
	});

	socket.on("answercall", async ({ to, responder, callData, signal }) => {
		const roomId = getRoomId([to, responder]);
		await updateCallStatus(callData, "answered");
		socket.join(roomId);
		io.to(to).emit("callaccepted", signal);
	});

	socket.on("rejectcall", ({ userToReject }) => {
		io.to(userToReject).emit("call rejected");
	});

	socket.on("leavecall", async ({ roomId, leaver, callData }) => {
		if (!roomId) return;
		const participants = getRoomParticipants(roomId);
		let otherUser = participants.find((p) => p !== leaver);
		socket.leave(roomId);
		await updateCallEnded(callData);
		io.to(otherUser).emit("userleft", { leaver });
	});

	socket.on("statuschanged", async ({ user }) => {
		const { status } = user;
		if (!status) return;
		socket.broadcast.emit("statuschanged", { userId: user._id, status });
	});
});

mongoose
	.connect(process.env.MONGODB_CONNECTION_STRING, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		autoIndex: false,
	})
	.then(() => console.log("DB Connection established"));

server.listen(process.env.PORT, () => {
	console.log(`listening on ${process.env.PORT}`);
});

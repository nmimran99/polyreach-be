import bodyParser from "body-parser";
import cors from "cors";
require("dotenv").config();
import express from "express";
import mongoose from "mongoose";
import path from "path";
global.fetch = require("node-fetch");
global.appRoot = path.resolve(__dirname);
global.publicFolder = path.join(process.cwd(), "/public");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(process.cwd() + "/public"));

mongoose
	.connect(process.env.MONGODB_CONNECTION_STRING, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		autoIndex: false,
	})
	.then(() => console.log("connected"));

app.listen(process.env.PORT, () => {
	console.log(`listening on ${process.env.PORT}`);
});

import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/address", async (req, res) => {
	let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${req.query.input}&types=(cities)&language=en&key=${process.env.GOOGLE_API_KEY}`;
	url = encodeURI(url);
	let results = await axios.get(url);
	res.status(200).json(results.data);
});

export default router;

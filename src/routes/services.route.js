import { Router } from "express";

const router = Router();

router.get("/address", (req, res) => {
	let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${req.query.input}&types=(cities)&components=country:ca&language=en&key=${process.env.GOOGLE_API_KEY}`;
	url = encodeURI(url);
	let results = await fetch(url);
	let data = await results.json();
	res.status(200).json(data);
});

export default router;

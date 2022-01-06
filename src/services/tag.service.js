import Tag from "../models/tag.model";

export const createTag = async (req, res) => {
	const { name } = req.body;

	try {
		const tag = new Tag({ name: name });
		const savedTag = await tag.save();
		res.status(200).send({ tag: savedTag });
		return;
	} catch (e) {
		console.log(e.message);
		res.status(500).send({ error: e.message });
	}
};

export const getTags = async (req, res) => {
	try {
		const tags = await Tag.find({});
		res.status(200).send(tags);
		return;
	} catch {
		console.log(e.message);
		res.status(500).send({ error: e.message });
	}
};

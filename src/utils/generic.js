import fs from "fs";

export const removeFile = async (module, parent, filename) => {
	return new Promise((resolve, reject) => {
		const filePath = path.join(publicFolder, module, parent, filename);
		if (!fs.existsSync(filePath)) resolve(true);
		fs.unlink(filePath, function (err) {
			if (err) console.log(err);
		});
		resolve(true);
	});
};

export const removeFileByPath = async (filepath) => {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(filepath)) resolve(true);
		fs.unlink(filepath, function (err) {
			if (err) console.log(err);
		});
		resolve(true);
	});
};
export const removeDuplicateObjectIds = (inputArray) => {
	const sortedArray = inputArray.sort((a, b) =>
		a.toString() > b.toString() ? 1 : a.toString() < b.toString() ? -1 : 0
	);

	let lastSeen = null;
	return sortedArray.reduce((sum, element) => {
		if (lastSeen != element) {
			sum.push(element);
		}
		lastSeen = element;
		return sum;
	}, []);
};

export const createURL = async (fileName) => {
	return `${process.env.BLOB_IMAGES_URL}/${fileName}`;
};

export const getRoomId = (participants) => {
	return participants.join("@@");
};

export const getRoomParticipants = (roomId) => {
	return roomId.split("@@");
};

import { BlobServiceClient } from "@azure/storage-blob";
import { createURL, removeFileByPath } from "./generic";

export const uploadFilesToBlob = async (files, container) => {
	if (!files.length) return [];
	const blobServiceClient = BlobServiceClient.fromConnectionString(
		process.env.BLOB_CONNECTION_STRING
	);
	const containerClient = blobServiceClient.getContainerClient(container);
	let promises = [];
	for await (const file of files) {
		const blobName =
			container.slice(0, -1) + "_" + new Date().getTime() + "_" + file.filename;
		const blockBlobClient = containerClient.getBlockBlobClient(blobName);
		await blockBlobClient.uploadFile(file.path);
		blockBlobClient.setHTTPHeaders({ blobContentType: file.mimetype });
		await removeFileByPath(file.path);
		promises.push(createURL(`${container}/${blobName}`));
	}

	return Promise.all(promises);
};

export const removeFileFromBlob = async (url) => {
	try {
		const { container, blobName } = getBlobPathParts(url);
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.BLOB_CONNECTION_STRING
		);
		const containerClient = blobServiceClient.getContainerClient(container);
		const blockBlobClient = containerClient.getBlockBlobClient(blobName);
		return await blockBlobClient.delete();
	} catch (e) {
		console.log(e.message);
		return null;
	}
};

export const getBlobPathParts = (url) => {
	const base = url.replace("https://");
	const [storage, container, blobName] = base.split("/");
	return {
		container,
		blobName,
	};
};

export const downloadFromBlob = async (req, res) => {
	async function streamToBuffer(readableStream) {
		return new Promise((resolve, reject) => {
			const chunks = [];
			readableStream.on("data", (data) => {
				chunks.push(data instanceof Buffer ? data : Buffer.from(data));
			});
			readableStream.on("end", () => {
				resolve(Buffer.concat(chunks));
			});
			readableStream.on("error", reject);
		});
	}

	try {
		const { container, blobName } = getBlobPathParts(req.query.url);
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.BLOB_CONNECTION_STRING
		);
		const containerClient = blobServiceClient.getContainerClient(container);
		const blockBlobClient = containerClient.getBlockBlobClient(blobName);
		const downloadBlockBlobResponse = await blockBlobClient.download();
		const st = await streamToBuffer(
			downloadBlockBlobResponse.readableStreamBody
		);
		return res.status(200).send(st);
	} catch (e) {
		console.log(e.message);
		return null;
	}
};

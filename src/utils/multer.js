import multer from "multer";
import path from "path";

const avatarStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/uploads/");
	},
	filename: function (req, file, cb) {
		cb(null, "avatar_" + Date.now() + path.extname(file.originalname));
	},
	fileFilter: function (req, file, cb) {
		const fileTypes = /jpeg|jpg|png/;
		const extname = filetypes.test(
			path.extname(file.originalname).toLowerCase()
		);
		const mimetpye = fileTypes.test(file.mimetpye);

		if (mimetpye && extname) {
			return cb(null, true);
		} else {
			cb("Error: Images only");
		}
	},
});

export const uploadAvatar = multer({ storage: avatarStorage });

const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "uploads/");
    },
    filename(req, file, cb) {
        cb(
            null,
            `${Date.now()}-${file.originalname}`
        );
    },
});

const fileFilter = (req, file, cb) => {
    const fileTypes = /jpg|jpeg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb("Images only!");
    }
};

const upload = multer({
    storage,
    fileFilter,
});

module.exports = upload;

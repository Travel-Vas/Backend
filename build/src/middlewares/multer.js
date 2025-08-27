"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer = require("multer");
const Path = require("path");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "/tmp/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    const validExts = [".png", ".jpg", ".jpeg"];
    if (!validExts.includes(Path.extname(file.originalname))) {
        console.log(Path.extname(file.originalname));
        //reject file
        cb({
            message: "Unsupported file format",
            ext: Path.extname(file.originalname),
        }, false);
    }
    else {
        cb(null, true);
    }
};
exports.upload = multer({
    storage: storage,
    //   limits: {
    //     fileSize: 1024 * 1024,
    //   },
    fileFilter: fileFilter,
});
//   module.exports = upload;

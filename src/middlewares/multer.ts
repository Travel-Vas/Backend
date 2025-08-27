import { Request } from "express";

const multer = require("multer");
const Path = require("path");
const storage = multer.diskStorage({
  destination: function (req:Request, file:any, cb:any) {
    cb(null, "/tmp/");
  },
  filename: function (req:Request, file:any, cb:any) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req:Request, file:any, cb:any) => {
    const validExts = [".png", ".jpg", ".jpeg"];
    if (!validExts.includes(Path.extname(file.originalname))) {
      console.log(Path.extname(file.originalname));
      //reject file
      cb(
        {
          message: "Unsupported file format",
          ext: Path.extname(file.originalname),
        },
        false
      );
    } else {
      cb(null, true);
    }
}
export const upload = multer({
    storage: storage,
    //   limits: {
    //     fileSize: 1024 * 1024,
    //   },
    fileFilter: fileFilter,
  });
  
//   module.exports = upload;
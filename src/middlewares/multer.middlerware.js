import multer from "multer";

const storage = multer.diskStorage({
  //des where we want store file
  destination: function (req, file, cb) {
    return cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // date.now is used for handle same file 
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage: storage });

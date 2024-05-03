// require("dotenv").config();
// const multers3 = require("multer-s3");
// const multer = require("multer");
// const aws = require("aws-sdk");

// const s3Config = new aws.S3({
//   region: process.env.REGION,
//   accessKeyId: process.env.ACCESS_KEY,
//   secretAccessKey: process.env.ACCESS_KEY_SECRET,
// });

// const multerS3 = new multers3({
//   s3: s3Config,
//   bucket: process.env.BUCKET_NAME,
//   metadata: (req, file, cb) => {
//     console.log("file", JSON.stringify(file));
//     cb(null, { fieldName: file.fieldname });
//   },
//   key: (req, file, cb) => {
//     console.log("key", file);
//     cb(null, new Date().toISOString() + "-" + file.originalname);
//   },
// });

// const multer = require("multer");
// const path = require("path");

// const folderPath = "../../../LeapifyTalkFront/src/assets/uploads";
// const Path = path.join(__dirname , folderPath);

// const fs = require("fs");

// if (!fs.existsSync(Path)) {
//   console.log("Creating directory:", Path);
//   fs.mkdirSync(Path);
// } else {
//   console.log("Directory already exists:", Path);
// }

// const multerS3 = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, Path);
//   },
//   metadata: (req, file, cb) => {
//     cb(null, { fieldName: file.fieldname });
//   },
//   key: function (req, file, cb) {
//     cb(null, new Date().toISOString() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage: multerS3 });

// module.exports = upload;


const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const path = require("path");

const s3 = new aws.S3({
  /* Your AWS configuration */
});

const bucketName = "https://srv1268-files.hstgr.io/dd571d8903fe2f51/files/public_html/assets/uploads/"; // Replace with your S3 bucket name

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, new Date().toISOString() + "-" + file.originalname);
    },
  }),
});

module.exports = upload;

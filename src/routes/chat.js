const express = require("express");
const {
  addChat,
  removeChat,
  likeChat,
  commentChat,
  reportChat,
  getChat,
  addReaction,
} = require("../controllers/chat");
const router = new express.Router();
const multer = require("multer");
const { auth } = require("../middlewares/auth");
const upload = require("../utils/s3");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
// const upload = multer({ storage: storage });

// router.post('/create-room')
router.post("/add", upload.any("file"), addChat);
router.post("/remove", removeChat);

router.put("/:id/like", auth, likeChat);
router.put("/:id/comment", auth, commentChat);

router.put("/:id/report", auth, reportChat);

router.put("/:id/reaction", auth, addReaction);

router.get("/:id", getChat);

module.exports = router;

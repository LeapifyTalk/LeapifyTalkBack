const express = require("express");
const { clearAll, getAll } = require("../controllers/notifications");
const router = new express.Router();
const { auth } = require("../middlewares/auth");

router.post("/clearAll", auth, clearAll);
router.get("/all", auth, getAll);

module.exports = router;

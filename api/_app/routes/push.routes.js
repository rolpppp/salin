const express = require("express");
const router = express.Router();
const pushController = require("../controllers/push.controller.js");
const authMiddleware = require("../middleware/auth.js");

router.use(authMiddleware);

router.post("/subscribe", pushController.subscribe);
router.post("/unsubscribe", pushController.unsubscribe);

module.exports = router;

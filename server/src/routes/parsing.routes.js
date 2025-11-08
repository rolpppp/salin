const express = require("express");
const router = express.Router();
const parsingController = require("../controllers/parsing.controller.js");
const authMiddleware = require("../middleware/auth.js");

router.post("/", authMiddleware, parsingController.parseText);

module.exports = router;

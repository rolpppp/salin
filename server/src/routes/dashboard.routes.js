const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller.js");
const authMiddleware = require("../middleware/auth.js");

router.get("/", authMiddleware, dashboardController.getDashboardData);

module.exports = router;

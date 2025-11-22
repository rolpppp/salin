// api/_app/routes/user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const authMiddleware = require("../middleware/auth.js");

router.get("/", authMiddleware, userController.getUser);
router.put("/", authMiddleware, userController.updateUser);

module.exports = router;
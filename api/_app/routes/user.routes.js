// api/_app/routes/user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const authMiddleware = require("../middleware/auth.js");
const { validate } = require("../middleware/validate.js");
const { updateUserSchema } = require("../schemas/index.js");

router.get("/", authMiddleware, userController.getUser);
router.put("/", authMiddleware, validate(updateUserSchema), userController.updateUser);

module.exports = router;
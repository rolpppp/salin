const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller.js");
const { validate } = require("../middleware/validate.js");
const { loginSchema, registerSchema } = require("../schemas/index.js");

router.post("/register", validate(registerSchema), authController.registerUser);
router.post("/login", validate(loginSchema), authController.loginUser);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/google", authController.googleSignIn);
router.post("/oauth/callback", authController.handleOAuthCallback);

module.exports = router;

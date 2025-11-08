const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account.controller.js");
const authMiddleware = require("../middleware/auth.js");

router.use(authMiddleware);

// CRUD for Accounts
router.post("/", accountController.createAccount);
router.get("/", accountController.getAccount);
router.put("/:id", accountController.updateAccount);
router.delete("/:id", accountController.deleteAccount);

module.exports = router;

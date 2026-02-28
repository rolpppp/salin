const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account.controller.js");
const authMiddleware = require("../middleware/auth.js");
const { validate } = require("../middleware/validate.js");
const { createAccountSchema, updateAccountSchema } = require("../schemas/index.js");

router.use(authMiddleware);

// CRUD for Accounts
router.post("/", validate(createAccountSchema), accountController.createAccount);
router.get("/", accountController.getAccount);
router.put("/:id", validate(updateAccountSchema), accountController.updateAccount);
router.delete("/:id", accountController.deleteAccount);

module.exports = router;

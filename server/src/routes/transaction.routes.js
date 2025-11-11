const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller.js");
const authMiddleware = require("../middleware/auth.js");

// a user must be logged in to perform transactions
router.use(authMiddleware);

// CRUD for transactions
router.post("/", transactionController.createTransaction);
router.get("/", transactionController.getTransactions);
router.put("/:id", transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;

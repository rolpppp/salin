const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budget.controller.js");
const authMiddleware = require("../middleware/auth.js");

router.use(authMiddleware);

// CRUD for budget
router.post("/", budgetController.createBudget);
router.get("/current", budgetController.getCurrentBudget);
router.put("/:id", budgetController.updateBudget);
router.delete("/:id", budgetController.deleteBudget);

module.exports = router;

const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budget.controller.js");
const authMiddleware = require("../middleware/auth.js");
const { validate } = require("../middleware/validate.js");
const { createBudgetSchema, updateBudgetSchema } = require("../schemas/index.js");

router.use(authMiddleware);

// CRUD for budget
router.post("/", validate(createBudgetSchema), budgetController.createBudget);
router.get("/current", budgetController.getCurrentBudget);
router.put("/:id", validate(updateBudgetSchema), budgetController.updateBudget);
router.delete("/:id", budgetController.deleteBudget);

module.exports = router;

const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller.js");
const authMiddleware = require("../middleware/auth.js");
const { validate } = require("../middleware/validate.js");
const { createCategorySchema, updateCategorySchema } = require("../schemas/index.js");

router.use(authMiddleware);

// CRUD operations for categories
router.post("/", validate(createCategorySchema), categoryController.createCategory);
router.get("/", categoryController.getCategory);
router.get("/type/:type", categoryController.getCategoryByType);
router.put("/:id", validate(updateCategorySchema), categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;

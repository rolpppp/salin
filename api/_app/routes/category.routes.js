const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller.js");
const authMiddleware = require("../middleware/auth.js");

router.use(authMiddleware);

// CRUD operations for categories
router.post("/", categoryController.createCategory);
router.get("/", categoryController.getCategory);
router.get("/type/:type", categoryController.getCategoryByType);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;

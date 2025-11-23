const supabase = require("../config/supabase");

// creates a new category with associated keywords for smart categorization
exports.createCategory = async (req, res, next) => {
  const userId = req.user.id;
  const { name, type, keywords } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const { data, error } = await supabase
      .from("categories")
      .insert({ user_id: userId, name, type, keywords: keywords || null })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Category created successfully", data });
  } catch (error) {
    next(error);
  }
};

// retrieves all categories for the user
exports.getCategory = async (req, res, next) => {
  const userID = req.user.id;
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userID);

    if (error) throw error;
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

// retrieves categories filtered by type for the user
exports.getCategoryByType = async (req, res, next) => {
  const userID = req.user.id;
  const { type } = req.params;
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userID)
      .eq("type", type);

    if (error) throw error;
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

// updates an existing category, including its keywords
exports.updateCategory = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data: existingCategory, error: findError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (findError || !existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // update category
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res
      .status(200)
      .json({ message: "Category updated successfully", transaction: data });
  } catch (error) {
    next(error);
  }
};

// deletes a category
exports.deleteCategory = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const { data: existingCategory, error: findError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (findError || !existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    const { data, error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const { start } = require("repl");
const supabase = require("../config/supabase");

exports.createBudget = async (req, res, next) => {
  const userId = req.user.id;
  const now = new Date();
  const { amount, month } = req.body;
  const year = now.getFullYear();

  if (!amount || !month) {
    return res
      .status(400)
      .json({ error: "Budget amount and month are required" });
  }

  try {
    const { data, error } = await supabase
      .from("budgets")
      .insert({ user_id: userId, amount, month, year })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Budget created successfully", data });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentBudget = async (req, res, next) => {
  const userID = req.user.id;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  try {
    const { data: budgetData, error } = await supabase
      .from("budgets")
      .select("id, amount")
      .eq("user_id", userID)
      .eq("month", month)
      .eq("year", year)
      .single();

    // Handle case when no budget exists (PGRST116 error)
    if (error && error.code !== "PGRST116") throw error;

    // calculate total spent
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const { data: spentData, error: spentError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userID)
      .eq("type", "expense")
      .gte("date", startDate)
      .lte("date", now.toISOString().split("T")[0]);

    if (spentError) throw spentError;

    const totalSpent = spentData.reduce(
      (sum, transaction) => sum + parseFloat(transaction.amount),
      0,
    );

    res.status(200).json({
      id: budgetData.data.id,
      amount: budgetData.data ? budgetData.data.amount : 0,
      spent: totalSpent,
      month,
      year,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBudget = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data: existingBudget, error: findError } = await supabase
      .from("budgets")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (findError || !existingBudget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    // update Budget
    const { data, error } = await supabase
      .from("budgets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res
      .status(200)
      .json({ message: "Budget updated successfully", transaction: data });
  } catch (error) {
    next(error);
  }
};

exports.deleteBudget = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const { data: existingBudget, error: findError } = await supabase
      .from("budgets")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (findError || !existingBudget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    const { data, error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Budget deleted successfully" });
  } catch (error) {
    next(error);
  }
};

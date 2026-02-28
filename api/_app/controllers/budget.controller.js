const supabase = require("../config/supabase");

// handles budget creation (monthly or semester)
exports.createBudget = async (req, res, next) => {
  const userId = req.user.id;
  const now = new Date();
  const {
    amount,
    month,
    period_type = "monthly",
    start_date,
    end_date,
  } = req.body;
  const year = now.getFullYear();

  if (!amount) {
    return res.status(400).json({ error: "Budget amount is required" });
  }

  if (period_type === "monthly" && !month) {
    return res.status(400).json({ error: "Month is required for monthly budgets" });
  }

  if (period_type === "semester" && (!start_date || !end_date)) {
    return res.status(400).json({ error: "start_date and end_date are required for semester budgets" });
  }

  try {
    const insertPayload = {
      user_id: userId,
      amount,
      period_type,
    };

    if (period_type === "monthly") {
      insertPayload.month = month;
      insertPayload.year = year;
    } else {
      insertPayload.start_date = start_date;
      insertPayload.end_date = end_date;
    }

    const { data, error } = await supabase
      .from("budgets")
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Budget created successfully", data });
  } catch (error) {
    next(error);
  }
};

// gets the active budget for today (monthly or semester)
exports.getCurrentBudget = async (req, res, next) => {
  const userID = req.user.id;
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  try {
    // Try to find a semester budget covering today first, then fall back to monthly
    let budgetData = null;
    let startDate, endDate;

    const { data: semesterBudget, error: semErr } = await supabase
      .from("budgets")
      .select("id, amount, period_type, start_date, end_date")
      .eq("user_id", userID)
      .eq("period_type", "semester")
      .lte("start_date", today)
      .gte("end_date", today)
      .maybeSingle();

    if (semErr && semErr.code !== "PGRST116") throw semErr;

    if (semesterBudget) {
      budgetData = semesterBudget;
      startDate = semesterBudget.start_date;
      endDate = semesterBudget.end_date;
    } else {
      // Monthly budget
      const { data: monthlyBudget, error: monErr } = await supabase
        .from("budgets")
        .select("id, amount, period_type")
        .eq("user_id", userID)
        .eq("period_type", "monthly")
        .eq("month", month)
        .eq("year", year)
        .maybeSingle();

      if (monErr && monErr.code !== "PGRST116") throw monErr;

      budgetData = monthlyBudget;
      startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      endDate = today;
    }

    if (!budgetData) {
      return res.status(200).json({ id: null, amount: 0, spent: 0, period_type: "monthly", month, year });
    }

    // Calculate total spent within the budget period
    const { data: spentData, error: spentError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userID)
      .eq("type", "expense")
      .gte("date", startDate)
      .lte("date", endDate);

    if (spentError) throw spentError;

    const totalSpent = spentData.reduce(
      (sum, t) => sum + parseFloat(t.amount),
      0
    );

    res.status(200).json({
      id: budgetData.id,
      amount: parseFloat(budgetData.amount || 0),
      spent: totalSpent,
      period_type: budgetData.period_type || "monthly",
      start_date: budgetData.start_date || null,
      end_date: budgetData.end_date || null,
      month,
      year,
    });
  } catch (error) {
    next(error);
  }
};

// updates the budget
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

// deletes the budget
exports.deleteBudget = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  // retrieves current month's budget
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

    // deletes the existing budget
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

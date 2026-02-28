const supabase = require("../config/supabase.js");

// create new transaction
exports.createTransaction = async (req, res, next) => {
  const userId = req.user.id;
  const { title, amount, type, date, description, account_id, category_id } =
    req.body;

  // validation
  if (!title || !amount || !type || !date || !account_id || !category_id) {
    console.error("❌ Validation failed - missing fields");
    return res.status(400).json({
      error: "Required fields are missing",
      received: { title, amount, type, date, account_id, category_id },
    });
  }

  try {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        title,
        amount,
        type,
        date,
        description,
        account_id,
        category_id,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      throw error;
    }

    console.log("✅ Transaction created:", data);
    res.status(201).json({
      message: "Transaction created successfully.",
      transaction: data,
    });
  } catch (error) {
    console.error("❌ Create transaction error:", error);
    next(error);
  }
};

// get transactions with server-side pagination
exports.getTransactions = async (req, res, next) => {
  const userId = req.user.id;
  const { startDate, endDate, type, categoryId, accountId, search } = req.query;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        categories(name),
        accounts(name)
        `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);
    if (type) query = query.eq("type", type);
    if (categoryId) query = query.eq("category_id", categoryId);
    if (accountId) query = query.eq("account_id", accountId);
    if (search) query = query.ilike("title", `%${search}%`);

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    next(error);
  }
};

// update a transaction
// Balance is updated atomically by DB trigger (see migrations/001_transaction_balance_triggers.sql)
exports.updateTransaction = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data: existingTransaction, error: findError } = await supabase
      .from("transactions")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (findError || !existingTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res
      .status(200)
      .json({ message: "Transaction updated successfully", transaction: data });
  } catch (error) {
    console.error("❌ Update transaction error:", error);
    next(error);
  }
};

// delete a transaction
exports.deleteTransaction = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // Verify if transaction belongs to the user
    const { data: existingTransaction, error: findError } = await supabase
      .from("transactions")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (findError || !existingTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Delete the transaction (database triggers should handle balance update)
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("❌ Delete transaction error:", error);
    next(error);
  }
};

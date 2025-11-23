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

// get all transactions
exports.getTransactions = async (req, res, next) => {
  const userId = req.user.id;
  const { startDate, endDate, type, categoryId, accountId, search } = req.query; //filtering or sorting

  try {
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        categories(name),
        accounts(name)
        `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);
    if (type) query = query.eq("type", type);
    if (categoryId) query = query.eq("category_id", categoryId);
    if (accountId) query = query.eq("account_id", accountId);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// update a transaction
exports.updateTransaction = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;
  const updates = req.body;

  try {
    // Get the existing transaction with all details
    const { data: existingTransaction, error: findError } = await supabase
      .from("transactions")
      .select("id, account_id, amount, type")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (findError || !existingTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Check if account or amount or type is being changed
    const accountChanged = updates.account_id && updates.account_id !== existingTransaction.account_id;
    const amountChanged = updates.amount && parseFloat(updates.amount) !== parseFloat(existingTransaction.amount);
    const typeChanged = updates.type && updates.type !== existingTransaction.type;

    // If account, amount, or type changed, we need to manually update balances
    if (accountChanged || amountChanged || typeChanged) {
      // Step 1: Revert the old transaction's effect on the old account
      const { data: oldAccount } = await supabase
        .from("accounts")
        .select("balance")
        .eq("id", existingTransaction.account_id)
        .single();

      if (oldAccount) {
        let newOldBalance = parseFloat(oldAccount.balance);
        
        if (existingTransaction.type === 'expense') {
          // Add back the expense amount
          newOldBalance += parseFloat(existingTransaction.amount);
        } else if (existingTransaction.type === 'income') {
          // Subtract the income amount
          newOldBalance -= parseFloat(existingTransaction.amount);
        }

        await supabase
          .from("accounts")
          .update({ balance: newOldBalance })
          .eq("id", existingTransaction.account_id);
      }

      // Step 2: Apply the new transaction's effect on the new account
      const newAccountId = updates.account_id || existingTransaction.account_id;
      const newAmount = parseFloat(updates.amount || existingTransaction.amount);
      const newType = updates.type || existingTransaction.type;

      const { data: newAccount } = await supabase
        .from("accounts")
        .select("balance")
        .eq("id", newAccountId)
        .single();

      if (newAccount) {
        let newAccountBalance = parseFloat(newAccount.balance);
        
        if (newType === 'expense') {
          // Subtract the expense amount
          newAccountBalance -= newAmount;
        } else if (newType === 'income') {
          // Add the income amount
          newAccountBalance += newAmount;
        }

        await supabase
          .from("accounts")
          .update({ balance: newAccountBalance })
          .eq("id", newAccountId);
      }
    }

    // Update transaction
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

const supabase = require("../config/supabase.js");

// create new transaction
exports.createTransaction = async (req, res, next) => {
  const userId = req.user.id;
  const { title, amount, type, date, description, account_id, category_id } =
    req.body;

  // validation
  if (!title || !amount || !type || !date || !account_id || !category_id) {
    console.error('❌ Validation failed - missing fields');
    return res.status(400).json({ 
      error: "Required fields are missing",
      received: { title, amount, type, date, account_id, category_id }
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
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Transaction created:', data);
    res.status(201).json({
      message: "Transaction created successfully.",
      transaction: data,
    });
  } catch (error) {
    console.error('❌ Create transaction error:', error);
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
      .select(`
        *,
        categories(name),
        accounts(name)
        `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    if (type) query = query.eq('type', type);
    if (categoryId) query = query.eq('category_id', categoryId);
    if (accountId) query = query.eq('account_id', accountId);
    if (search) query = query.ilike('title', `%${search}%`);

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
    // verify if transaction belongs to the user
    const { data: existingTransaction, error: findError } = await supabase
      .from("transactions")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (findError || !existingTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // update transaction
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
    next(error);
  }
};

// delete a transaction
exports.deleteTransaction = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // verify if transaction belongs to the user
    const { error } = await supabase.rpc('delete_transaction_and_update_balance');

    if (error) throw error;

    res
      .status(200)
      .json({ message: "Transaction deleted successfully"});
  } catch (error) {
    if (error.message.includes('Transaction not found')) {
            return res.status(404).json({ error: error.message });
        }
    next(error);
  }
};

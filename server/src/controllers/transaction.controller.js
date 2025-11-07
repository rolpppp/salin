const supabase = require("../config/supabase.js");

// create new transaction
exports.createTransaction = async (req, res, next) => {
  const userId = req.user.id;
  const { title, amount, type, date, description, account_id, category_id } =
    req.body;

  // validation
  if (!title || !amount || !type || !date || !account_id || !category_id) {
    res.status(400).json({ error: "Required fields are missing" });
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

    if (error) throw error;

    res.status(201).json({
      message: "Transaction created successfully.",
      transaction: data,
    });
  } catch (error) {
    console.log(`error: ${error.message}`);
    console.log("userId: ", userId);
    console.log("req user: ", req.user);
    next(error);
  }
};

// get all transactions
exports.getTransaction = async (req, res, next) => {
  const userId = req.user.id;
  const { limit, sortBy = "date", order = "desc" } = req.query; //filtering or sorting

  try {
    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order(sortBy, { ascending: order == "asc" });

    if (limit) {
      query = query.limit(parseLimit(limit, 10));
    }

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
  console.log({ id });
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
    const { data: existingTransaction, error: findError } = await supabase
      .from("transactions")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (findError || !existingTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // delete transaction
    const { data, error } = await supabase
      .from("transactions")
      .delete()
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

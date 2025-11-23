const supabase = require("../config/supabase");

// creates a new financial account for the user
exports.createAccount = async (req, res, next) => {
  const userId = req.user.id;
  const { name, type, balance = 0 } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: "Name or type are required." });
  }

  try {
    allow_negative = type == "credit_card";

    const { data, error } = await supabase
      .from("accounts")
      .insert({ user_id: userId, name, type, balance })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Account created successfully", data });
  } catch (error) {
    next(error);
  }
};

// retrieves all financial accounts belonging to the user
exports.getAccount = async (req, res, next) => {
  const userID = req.user.id;
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userID);

    if (error) throw error;
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

// updates an existing financial account for the user
exports.updateAccount = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data: existingAccount, error: findError } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (findError || !existingAccount) {
      return res.status(404).json({ error: "Account not found" });
    }

    // update account
    const { data, error } = await supabase
      .from("accounts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res
      .status(200)
      .json({ message: "Account updated successfully", transaction: data });
  } catch (error) {
    next(error);
  }
};

// deletes a financial account for the user
exports.deleteAccount = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const { data: existingAccount, error: findError } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (findError || !existingAccount) {
      return res.status(404).json({ error: "Account not found" });
    }

    const { data, error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
};

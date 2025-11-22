// api/_app/controllers/user.controller.js
const supabase = require("../config/supabase");

// get user data
exports.getUser = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // Get user from auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.admin.getUserById(userId);
    if (authError) throw authError;

    // Get username from users table
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("username")
      .eq("id", userId)
      .single();

    if (usersError && usersError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw usersError;
    }

    // Combine auth user data with username from users table
    const userData = {
      ...user,
      username: usersData?.username || null,
    };

    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};

// update user metadata
exports.updateUser = async (req, res, next) => {
  const userId = req.user.id;
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "username is required." });
  }

  try {
    // Check if user record exists in users table
    const { data: existingData, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    let result;
    if (existingData) {
      // Update existing record
      const { data, error } = await supabase
        .from("users")
        .update({ username })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from("users")
        .insert({ id: userId, username })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res
      .status(200)
      .json({ message: "user updated successfully", data: result });
  } catch (error) {
    next(error);
  }
};

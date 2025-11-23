// api/_app/controllers/user.controller.js
const supabase = require("../config/supabase");

// get user data
exports.getUser = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // get user from auth
    const {
      data: { user },
      error,
    } = await supabase.auth.admin.getUserById(userId);

    if (error) throw error;

    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("username")
      .eq("id", userId)
      .single();

    if (usersError && usersError.code !== "PGRST116") throw usersError;
    res.status(200).json(user);
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
    const { data: existingData, error: checkError } = await supabase
      .from("users")
      .select("username")
      .eq("id", userId)
      .single();

    if (checkError) throw checkError;

    let result;
    if (existingData) {
      const { data, error } = await supabase
        .from("users")
        .update({ username })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
    } else {
      // insert new record
      const { data, error } = await supabase
        .from("users")
        .insert({ id: userId, username })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.status(200).json({ message: "user updated successfully", data });
  } catch (error) {
    next(error);
  }
};

// api/_app/controllers/user.controller.js
const supabase = require("../config/supabase");

// get user data
exports.getUser = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.admin.getUserById(userId);

    if (authError) throw authError;

    // Get username from public.users table
    const { data: publicUser, error: publicError } = await supabase
      .from("users")
      .select("username")
      .eq("id", userId)
      .single();

    if (publicError && publicError.code !== "PGRST116") throw publicError;

    // Combine auth user with public user data
    const userData = {
      ...user,
      username: publicUser?.username || null,
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
    // Update username in public.users table
    const { data, error } = await supabase
      .from("users")
      .upsert({ id: userId, username: username }, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: "user updated successfully", data });
  } catch (error) {
    next(error);
  }
};

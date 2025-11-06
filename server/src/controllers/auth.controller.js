const supabase = require("../config/supabase");

// register a new user
exports.registerUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const { data: newUser, error: insertError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (insertError) throw insertError;

    res.status(201).json({
      message: "User created successfully.",
      user: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    next(error); // pass error
  }
};

// login new user
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    res.status(200).json({ message: "Log in successful" });
  } catch (error) {
    next(error);
  }
};

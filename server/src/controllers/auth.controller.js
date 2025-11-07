const supabase = require("../config/supabase");
const jwt = require("jsonwebtoken");

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
      res.status(401).json({ error: "Invalid log in credentials" });
    } else {
      const payload = {
        id: data.user.id,
        email: data.user.email,
      };

      if (!process.env.JWT_SECRET) {
        return res
          .status(500)
          .json({ error: "Authentication not configured." });
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d", // token expires in 1 day
      });

      res
        .status(200)
        .json({ message: "Log in successful", token, data: `${data.user.id}` });
    }
  } catch (error) {
    next(error);
  }
};

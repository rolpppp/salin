const supabase = require("../config/supabase");
const { createClient } = require("@supabase/supabase-js");
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

    // Generate JWT token for the new user
    const payload = {
      id: newUser.user.id,
      email: newUser.user.email,
    };

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Authentication not configured." });
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "User created successfully.",
      token,
      user: { id: newUser.user.id, email: newUser.user.email },
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

      res.status(200).json({
        message: "Log in successful",
        token,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// forgot password
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const originHeader = req.headers.origin;
  const fallbackOrigin =
    process.env.CLIENT_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.PUBLIC_SITE_URL ||
    "http://localhost:8080";
  const baseUrl = (originHeader || fallbackOrigin).replace(/\/$/, "");

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/#/reset-password`,
  });

  if (error) {
    console.error("Password reset error: ", error.message);
  }

  res.status(200).json({
    message:
      "If an account with that email exists, a password reset link has been sent.",
  });
};

exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header is missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required" });
  }

  try {
    // Verify the token and get the user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError) {
      console.error("Error getting user from token:", userError.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // The user is now authenticated. Update the password.
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Password update error:", updateError.message);
      return res.status(500).json({ message: "Failed to update password" });
    }

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Server error during password reset:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// google oauth sign in
exports.googleSignIn = async (req, res, next) => {
  try {
    const originHeader = req.headers.origin;
    const fallbackOrigin =
      process.env.CLIENT_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.PUBLIC_SITE_URL ||
      "http://localhost:8080";
    const baseUrl = (originHeader || fallbackOrigin).replace(/\/$/, "");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${baseUrl}/#/auth/callback`,
      },
    });

    if (error) throw error;

    res.status(200).json({
      url: data.url,
    });
  } catch (error) {
    next(error);
  }
};

// handle oauth callback and exchange for session
exports.handleOAuthCallback = async (req, res, next) => {
  try {
    const { access_token, refresh_token } = req.body;

    if (!access_token || !refresh_token) {
      return res.status(400).json({ error: "Missing tokens" });
    }

    // Set the session with the tokens
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) throw error;

    const userId = data.user.id;

    // Check if user exists in public.users table, create if not
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    let userData = existingUser;

    // If user doesn't exist in public.users table, create entry
    if (fetchError && fetchError.code === "PGRST116") {
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          id: userId,
          username: data.user.email.split("@")[0], // Use email prefix as default username
          full_name: data.user.user_metadata?.full_name || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating user record:", insertError);
        // Continue anyway, user can complete profile later
      }
      userData = newUser;
    } else if (fetchError) {
      throw fetchError;
    }

    // Generate JWT token for the user
    const payload = {
      id: data.user.id,
      email: data.user.email,
    };

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Authentication not configured." });
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Authentication successful",
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name:
          userData?.full_name || data.user.user_metadata?.full_name || null,
        avatar_url: data.user.user_metadata?.avatar_url || null,
        username: userData?.username || null,
        currency: userData?.currency || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

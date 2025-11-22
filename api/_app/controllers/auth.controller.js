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

  if (!email){
    return res.status(400).json({ error: "Email is required"});
  }

  const originHeader = req.headers.origin;
  const fallbackOrigin = process.env.CLIENT_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || "http://localhost:8080";
  const baseUrl = (originHeader || fallbackOrigin).replace(/\/$/, "");

  const {data, error} = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/#/reset-password`
  });

  if (error) {
    console.error("Password reset error: ", error.message);
  }

  res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent."});
}

// reset password
exports.resetPassword = async (req, res, next) => {
  const { newPassword } = req.body;
  const authHeader = req.header("Authorization");

  if(!newPassword || !authHeader){
    return res.status(400).json({ error: "A valid session token and new password are required."});
  }

  const token = authHeader.split(" ")[1];

  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false }}
    );

    console.log("Attempting to set session with recovery token...");
    
    // Set the session with the recovery access token
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.setSession({
      access_token: token,
      refresh_token: '' // Recovery tokens don't require refresh token
    });

    if (sessionError) {
      console.error("Session error:", sessionError.message, sessionError);
      return res.status(401).json({ error: "Invalid or expired token. Please request a new password reset." });
    }

    if (!sessionData?.user?.id) {
      console.error("No user in session data");
      return res.status(401).json({ error: "Invalid or expired token. Please request a new password reset." });
    }

    console.log("Session established for user:", sessionData.user.id);

    // Update password through the authenticated session
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      console.error("Password update error:", updateError.message || updateError);
      return res.status(400).json({ error: updateError.message || "Failed to update password." });
    }

    console.log("Password updated successfully for user:", sessionData.user.id);

    res.status(200).json({ message: "Password has been reset successfully. Please log in with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    next(error);
  }
}
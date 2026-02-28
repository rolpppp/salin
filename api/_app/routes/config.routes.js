const express = require("express");
const router = express.Router();

// returns public config values safe for browser use
// NOTE: only anon key and VAPID public key are exposed — never service/private keys
router.get("/", (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: "Server configuration incomplete." });
  }

  res.status(200).json({
    supabaseUrl,
    supabaseAnonKey,
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || null,
  });
});

module.exports = router;

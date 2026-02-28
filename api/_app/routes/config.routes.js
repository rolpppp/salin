const express = require("express");
const router = express.Router();

// returns public Supabase credentials safe for browser use
// NOTE: only anon key is exposed — never the service key
router.get("/", (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: "Server configuration incomplete." });
  }

  res.status(200).json({ supabaseUrl, supabaseAnonKey });
});

module.exports = router;

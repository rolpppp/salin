const gemini = require("../services/gemini.services.js");
const supabase = require("../config/supabase.js");

exports.parseText = async (req, res, next) => {
  const { text } = req.body;
  const userId = req.user.id;

  if (!text) {
    return res.status(400).json({ error: "Text to parse is required" });
  }

  try {
    // fetch user categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("name")
      .eq("user_id", userId);

    if (catError) throw catError;

    // call gemini service
    const parsedData = await gemini.parseTransactions(text, categories);

    res.status(200).json(parsedData);
  } catch (error) {
    next(error);
  }
};

const gemini = require("../services/gemini.services.js");
const supabase = require("../config/supabase.js");

// parses user-provided text into structured transaction data using gemini's ai capabilities
exports.parseText = async (req, res, next) => {
  const { text } = req.body;
  const userId = req.user.id;

  if (!text) {
    return res.status(400).json({ error: "Text to parse is required" });
  }

  try {
    // fetches user-defined categories to aid in smart categorization during parsing
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("name")
      .eq("user_id", userId);

    if (catError) throw catError;

    // calls the gemini service to intelligently parse the transaction text
    const parsedData = await gemini.parseTransactions(text, categories);

    res.status(200).json(parsedData);
  } catch (error) {
    next(error);
  }
};

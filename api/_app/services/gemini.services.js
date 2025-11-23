const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

// uses google's gemini ai to parse natural language transaction descriptions into structured data
async function parseTransactions(text, categories) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API Key is not configured");
  }

  // dynamically prepares a list of user-defined category names for the ai to use
  const categoryNames = categories.map((c) => c.name).join(", ");

  // constructs a detailed prompt for the gemini ai, guiding it on how to parse financial transactions
  const prompt = `You are an expert financial transaction parser for a money tracker app
        Analyze the following text and convert each distinct financial activity into a JSON object within a JSON array.

        **Rules:**
        1.  The current date is ${new Date().toISOString().split("T")[0]}.
        2.  If "yesterday" is mentioned, use the date for yesterday. If no date is mentioned, use today's date.
        3.  All amounts should be positive numbers.
        4.  Determine the 'type' as either "income" or "expense".
        5.  Assign a 'category' from this specific list ONLY: [${categoryNames}]. If no clear category matches, assign null.
        6.  The 'title' should be a concise summary of the activity.
        7.  The final output MUST be a valid JSON array string, and nothing else.

        **Text to parse:**
        "${text}"`;

  try {
    // sends the prompt to the gemini model for content generation
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log(response);

    // cleans and parses the ai's response to ensure valid json output
    const jsonText = response.text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("gemini api error: ", error);
    throw new Error(
      "failed to parse text with ai. the model may have returned an invalid format.",
    );
  }
}

module.exports = { parseTransactions };

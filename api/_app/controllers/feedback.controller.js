const { sendFeedbackEmail } = require("../services/email.service.js");

// Submit feedback
exports.submitFeedback = async (req, res, next) => {
  const userId = req.user ? req.user.id : "anonymous";
  const userEmail = req.user ? req.user.email : "anonymous";
  const { type, message, email, userAgent, url } = req.body;

  // Validation
  if (!type || !message) {
    return res.status(400).json({
      error: "Required fields are missing",
      required: ["type", "message"],
    });
  }

  const validTypes = ["bug", "feature", "improvement", "other"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      error: "Invalid feedback type",
      validTypes,
    });
  }

  try {
    console.log("📧 Preparing to send feedback email with data:", {
      type,
      message,
      email: email || userEmail,
      userId,
      userEmail,
      userAgent,
      url,
    });

    const result = await sendFeedbackEmail({
      type,
      message,
      email: email || userEmail,
      userId,
      userEmail,
      userAgent,
      url,
    });

    console.log("✅ Email service returned:", result);

    res.status(200).json({
      message: "Feedback submitted successfully. Thank you!",
      success: true,
    });
  } catch (error) {
    console.error("❌ Submit feedback error:", error);
    next(error);
  }
};

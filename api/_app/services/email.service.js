const { Resend } = require("resend");

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send feedback email using Resend
 * @param {Object} feedbackData - The feedback information
 * @param {string} feedbackData.type - Type of feedback (bug, feature, improvement, other)
 * @param {string} feedbackData.message - The feedback message
 * @param {string} feedbackData.email - User's email (optional)
 * @param {string} feedbackData.userId - User ID
 * @param {string} feedbackData.userEmail - User's registered email
 */
async function sendFeedbackEmail(feedbackData) {
  const { type, message, email, userId, userEmail, userAgent, url } =
    feedbackData;

  const feedbackTypeEmoji = {
    bug: "🐛",
    feature: "💡",
    improvement: "✨",
    other: "💬",
  };

  const emoji = feedbackTypeEmoji[type] || "📝";

  // Create the email content
  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .feedback-type { display: inline-block; background: #4F46E5; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-bottom: 16px; }
        .message-box { background: white; padding: 16px; border-left: 4px solid #4F46E5; margin: 16px 0; border-radius: 4px; }
        .metadata { font-size: 12px; color: #6b7280; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">${emoji} New Feedback from Salin</h2>
        </div>
        <div class="content">
          <div class="feedback-type">${type.toUpperCase()}</div>
          
          <div class="message-box">
            <strong>Message:</strong>
            <p style="margin: 8px 0 0 0; white-space: pre-wrap;">${message}</p>
          </div>

          <div class="metadata">
            <p><strong>From:</strong> ${userEmail} ${
    email && email !== userEmail ? `(Reply to: ${email})` : ""
  }</p>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            ${url ? `<p><strong>Page:</strong> ${url}</p>` : ""}
            ${userAgent ? `<p><strong>Browser:</strong> ${userAgent}</p>` : ""}
          </div>
        </div>
        <div class="footer">
          <p>Salin Money Tracker Feedback System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // Send email using Resend
    if (!process.env.RESEND_API_KEY || !process.env.FEEDBACK_EMAIL) {
      throw new Error("Email service not configured. Please contact support.");
    }

    const emailPayload = {
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Salin Feedback <feedback@salinmt.com>",
      to: process.env.FEEDBACK_EMAIL,
      replyTo: email || userEmail,
      subject: `${emoji} New ${type.toUpperCase()} Feedback from Salin`,
      html: emailContent,
    };

    console.log("📤 Sending email with payload:", {
      ...emailPayload,
      html: emailContent.substring(0, 200) + "...", // Log first 200 chars of HTML
    });

    const emailResult = await resend.emails.send(emailPayload);

    console.log("✅ Resend API response:", JSON.stringify(emailResult, null, 2));
    
    if (emailResult.error) {
      console.error("❌ Resend API error:", emailResult.error);
      throw new Error(`Failed to send email: ${JSON.stringify(emailResult.error)}`);
    }

    const emailId = emailResult.id || emailResult.data?.id;
    console.log("✅ Feedback email sent with ID:", emailId);

    return {
      success: true,
      emailId: emailId,
      message: "Feedback submitted successfully",
    };
  } catch (error) {
    console.error("❌ Error sending feedback email:", error);
    throw error;
  }
}

module.exports = {
  sendFeedbackEmail,
};

const express = require("express");
const router = express.Router();
const { checkAndSendReminders } = require("../utils/emailScheduler");
const { sendWelcomeEmail } = require("../utils/emailService");
const { isLoggedInAPI } = require("../middleware/auth");
const User = require("../models/User");

// Manual trigger for testing (protected route)
router.post("/test-reminders", isLoggedInAPI, async (req, res) => {
  try {
    console.log("Manual reminder check triggered by user");
    await checkAndSendReminders();
    res.json({
      success: true,
      message: "Reminder check completed. Check server logs for details.",
    });
  } catch (error) {
    console.error("Error in manual reminder check:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check reminders",
    });
  }
});

// Send test email to logged-in user's email address
router.post("/test-email", isLoggedInAPI, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    
    if (!user || !user.email) {
      return res.status(404).json({
        success: false,
        error: "User email not found",
      });
    }

    console.log(`📧 Sending test email to logged-in user: ${user.email}`);
    
    const result = await sendWelcomeEmail(user.email);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Test email sent successfully to ${user.email}. Check your inbox!`,
        email: user.email,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || "Failed to send test email",
        email: user.email,
      });
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send test email",
    });
  }
});

module.exports = router;


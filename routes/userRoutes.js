const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { isLoggedInAPI } = require("../middleware/auth");

router.get("/me", isLoggedInAPI, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ id: user._id, email: user.email });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
});

module.exports = router;

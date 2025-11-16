const express = require("express");
const router = express.Router();

function protect(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// Dashboard
router.get("/dashboard", protect, (req, res) => {
  res.render("dashboard", {
    page: "dashboard",
    currentUser: req.session.user,
  });
});

// Subjects
router.get("/subjects", protect, (req, res) => {
  res.render("subjects", {
    page: "subjects",
    currentUser: req.session.user,
  });
});

// Notifications
router.get("/notifications", protect, (req, res) => {
  res.render("notifications", {
    page: "notifications",
    currentUser: req.session.user,
  });
});

// Study Tips
router.get("/study-tips", protect, (req, res) => {
  res.render("study-tips", {
    page: "study-tips",
    currentUser: req.session.user,
  });
});

// Profile
router.get("/profile", protect, (req, res) => {
  res.render("profile", {
    page: "profile",
    currentUser: req.session.user,
  });
});

module.exports = router;

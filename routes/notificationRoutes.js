const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { isLoggedInAPI } = require("../middleware/auth");

// GET notifications for logged-in user
router.get("/", isLoggedInAPI, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.session.user.id,
    });
    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch notifications" });
  }
});

// ADD a notification
router.post("/add", isLoggedInAPI, async (req, res) => {
  try {
    const notif = await Notification.create({
      userId: req.session.user.id,
      ...req.body,
    });
    res.json({ success: true, notification: notif });
  } catch (error) {
    console.error("Error adding notification:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to add notification" });
  }
});

// MARK READ
router.post("/mark-read", isLoggedInAPI, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.body.id, { read: true });
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to mark notification as read" });
  }
});

// DELETE
router.post("/delete", isLoggedInAPI, async (req, res) => {
  try {
    const result = await Notification.findOneAndDelete({
      _id: req.body.id,
      userId: req.session.user.id,
    });
    if (!result) {
      return res
        .status(404)
        .json({ success: false, error: "Notification not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete notification" });
  }
});

// MARK ALL READ
router.post("/mark-all-read", isLoggedInAPI, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.session.user.id },
      { read: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to mark all notifications as read",
      });
  }
});

// CLEAR ALL
router.post("/clear-all", isLoggedInAPI, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.session.user.id });
    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to clear all notifications" });
  }
});

module.exports = router;

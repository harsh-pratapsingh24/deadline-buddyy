const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { isLoggedInAPI } = require("../middleware/auth");

// GET notifications for logged-in user
router.get("/", isLoggedInAPI, async (req, res) => {
    const notifications = await Notification.find({ userId: req.session.user.id });
    res.json({ success: true, notifications });
});

// ADD a notification
router.post("/add", isLoggedInAPI, async (req, res) => {
    const notif = await Notification.create({
        userId: req.session.user.id,
        ...req.body
    });
    res.json({ success: true, notification: notif });
});

// MARK READ
router.post("/mark-read", isLoggedInAPI, async (req, res) => {
    await Notification.findByIdAndUpdate(req.body.id, { read: true });
    res.json({ success: true });
});

// DELETE
router.post("/delete", isLoggedInAPI, async (req, res) => {
    await Notification.findOneAndDelete({
        _id: req.body.id,
        userId: req.session.user.id
    });
    res.json({ success: true });
});

// MARK ALL READ
router.post("/mark-all-read", isLoggedInAPI, async (req, res) => {
    await Notification.updateMany(
        { userId: req.session.user.id },
        { read: true }
    );
    res.json({ success: true });
});

// CLEAR ALL
router.post("/clear-all", isLoggedInAPI, async (req, res) => {
    await Notification.deleteMany({ userId: req.session.user.id });
    res.json({ success: true });
});

module.exports = router;

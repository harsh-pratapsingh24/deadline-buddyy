const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { isLoggedInAPI } = require("../middleware/auth");

// Protect all routes with API auth
router.use(isLoggedInAPI);

// ====================== ADD TASK + AUTO-NOTIFICATION ======================

router.post("/add", async (req, res) => {
    try {
        const { title, subject, date } = req.body;

        if (!title || !subject || !date) {
            return res.status(400).json({
                success: false,
                error: "All fields are required"
            });
        }

        // 1️⃣ Create the task in MongoDB
        const newTask = await Task.create({
            userId: req.session.user.id,
            title,
            subject,
            date,
        });

        // 2️⃣ Auto-create a notification for the task
        await Notification.create({
            userId: req.session.user.id,
            title: `Task Added: ${title}`,
            message: `A new task for ${subject} was added. Deadline: ${date}`,
            type: "deadline",
            priority: "high",
            subject,
            date,
            time: "00:00",
            read: false,
        });

        // 3️⃣ Respond to frontend
        res.json({ success: true, task: newTask });

    } catch (error) {
        console.error("Error adding task:", error);
        res.status(500).json({
            success: false,
            error: "Failed to add task"
        });
    }
});

// ====================== LIST TASKS ======================

router.get("/list", async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.session.user.id });
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch tasks"
        });
    }
});

// ====================== TOGGLE TASK COMPLETE ======================

router.post("/toggle", async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: "Task ID is required"
            });
        }

        const task = await Task.findOne({
            _id: id,
            userId: req.session.user.id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                error: "Task not found"
            });
        }

        task.isCompleted = !task.isCompleted;
        await task.save();

        res.json({ success: true });

    } catch (error) {
        console.error("Error toggling task:", error);
        res.status(500).json({
            success: false,
            error: "Failed to toggle task"
        });
    }
});
// ====================== RESET ALL TASKS ======================

router.post("/reset", async (req, res) => {
    try {
        await Task.deleteMany({ userId: req.session.user.id });
        res.json({ success: true });
    } catch (error) {
        console.error("Error resetting tasks:", error);
        res.status(500).json({
            success: false,
            error: "Failed to reset tasks"
        });
    }
});

// ====================== DELETE TASK ======================

router.post("/delete", async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: "Task ID is required"
            });
        }

        const task = await Task.findOneAndDelete({
            _id: id,
            userId: req.session.user.id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                error: "Task not found"
            });
        }

        res.json({ success: true });

    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete task"
        });
    }
});

// ====================== EXPORT ROUTER ======================

module.exports = router;

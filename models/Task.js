const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  priority: {
        type: String,
        enum: ["high", "medium", "low"],
        default: "medium"
    },
});

module.exports = mongoose.model("Task", taskSchema);

const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },        // deadline | exam | reminder
    priority: { type: String, required: true },    // high | medium | low
    subject: { type: String, required: true },
    date: { type: String, required: true },        // Keep as string for now
    time: { type: String, required: true },
    read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);

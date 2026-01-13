const cron = require("node-cron");
const Task = require("../models/Task");
const User = require("../models/User");
const { sendDeadlineReminder } = require("./emailService");

// Track last email sent to avoid duplicates
const lastEmailSent = new Map(); // userId -> { date, taskIds }

// Check if we should send email (avoid sending multiple times per day)
const shouldSendEmail = (userId, taskIds) => {
  const today = new Date().toDateString();
  const lastSent = lastEmailSent.get(userId);

  if (!lastSent || lastSent.date !== today) {
    return true;
  }

  // Check if there are new tasks
  const newTasks = taskIds.filter((id) => !lastSent.taskIds.includes(id.toString()));
  return newTasks.length > 0;
};

// Update last sent record
const updateLastSent = (userId, taskIds) => {
  lastEmailSent.set(userId, {
    date: new Date().toDateString(),
    taskIds: taskIds.map((id) => id.toString()),
  });
};

// Send email reminders for upcoming deadlines
const checkAndSendReminders = async () => {
  try {
    console.log("📧 Checking for upcoming deadlines and sending email reminders...");

    // Get all incomplete tasks with user email addresses
    const tasks = await Task.find({ isCompleted: false }).populate("userId", "email");
    
    if (tasks.length === 0) {
      console.log("No incomplete tasks found. No emails to send.");
      return;
    }
    
    console.log(`Found ${tasks.length} incomplete task(s) to check.`);

    // Group tasks by user
    const userTasks = new Map();

    tasks.forEach((task) => {
      if (!task.userId || !task.userId.email) return;

      const userId = task.userId._id.toString();
      if (!userTasks.has(userId)) {
        userTasks.set(userId, {
          user: task.userId,
          tasks: [],
        });
      }
      userTasks.get(userId).tasks.push(task);
    });

    // Check each user's tasks for upcoming deadlines
    let emailsSent = 0;
    let emailsSkipped = 0;
    
    for (const [userId, { user, tasks: userTaskList }] of userTasks) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter tasks that are due within the next 7 days (including today)
      const upcomingTasks = userTaskList.filter((task) => {
        try {
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          const daysUntil = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
          return daysUntil >= 0 && daysUntil <= 7; // Due today or within 7 days
        } catch (error) {
          console.error(`Error parsing date for task ${task._id}:`, error);
          return false;
        }
      });

      if (upcomingTasks.length > 0) {
        const taskIds = upcomingTasks.map((t) => t._id);

        // Check if we should send email (avoid duplicates)
        if (shouldSendEmail(userId, taskIds)) {
          console.log(`📬 Sending reminder email to: ${user.email} (${upcomingTasks.length} upcoming task(s))`);

          const result = await sendDeadlineReminder(
            user.email, // ✅ Sends to the user's registered email address
            user.email.split("@")[0], // Use email username as name
            upcomingTasks.map((task) => ({
              title: task.title,
              subject: task.subject,
              date: task.date,
              priority: task.priority || "medium",
            }))
          );

          if (result.success) {
            updateLastSent(userId, taskIds);
            console.log(`✅ Email successfully sent to: ${user.email}`);
            emailsSent++;
          } else {
            console.log(`❌ Failed to send email to ${user.email}:`, result.error);
          }
        } else {
          console.log(`⏭️  Skipping email to ${user.email} (already sent today for these tasks)`);
          emailsSkipped++;
        }
      } else {
        console.log(`ℹ️  No upcoming deadlines for ${user.email} (within 7 days)`);
      }
    }

    console.log(`\n📊 Email Reminder Summary:`);
    console.log(`   ✅ Emails sent: ${emailsSent}`);
    console.log(`   ⏭️  Emails skipped: ${emailsSkipped}`);
    console.log(`   👥 Total users checked: ${userTasks.size}`);
    console.log(`\n✅ Deadline check completed.\n`);
  } catch (error) {
    console.error("Error in deadline reminder check:", error);
  }
};

// Start the email scheduler
const startEmailScheduler = () => {
  // Run every day at 9:00 AM
  // Cron format: minute hour day month dayOfWeek
  // "0 9 * * *" = Every day at 9:00 AM
  cron.schedule("0 9 * * *", checkAndSendReminders, {
    scheduled: true,
    timezone: "America/New_York", // Adjust to your timezone
  });

  // Also run immediately on startup (for testing)
  // You can remove this in production if you only want scheduled emails
  console.log("Email scheduler started. Will check for deadlines daily at 9:00 AM.");
  
  // Uncomment the line below to test immediately
  // checkAndSendReminders();
};

module.exports = {
  startEmailScheduler,
  checkAndSendReminders, // Export for manual testing
};


const nodemailer = require("nodemailer");
require("dotenv").config();

// Create reusable transporter
const createTransporter = () => {
  // For Gmail, you can use OAuth2 or App Password
  // For simplicity, we'll use SMTP with App Password
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
    },
  });
};

// Send welcome email to new user
const sendWelcomeEmail = async (userEmail) => {
  try {
    const transporter = createTransporter();

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("Email credentials not configured. Skipping welcome email.");
      return { success: false, error: "Email not configured" };
    }

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00F5D4, #00D4AA); color: #1A1A2E; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .button { background: #00F5D4; color: #1A1A2E; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Deadline Buddy!</h1>
          </div>
          <div class="content">
            <p>Hi there!</p>
            <p>Welcome to Deadline Buddy! We're excited to help you stay on top of your deadlines.</p>
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Add your tasks and deadlines</li>
              <li>Get automatic email reminders for tasks due within 7 days</li>
              <li>Stay organized and never miss a deadline!</li>
            </ul>
            <p style="text-align: center;">
              <a href="${process.env.APP_URL || "http://localhost:3000"}/dashboard" class="button">
                Go to Dashboard
              </a>
            </p>
            <p><strong>📧 Email Reminders:</strong></p>
            <p>You'll receive automatic email reminders at <strong>${userEmail}</strong> for any tasks due within the next 7 days. Reminders are sent daily at 9:00 AM.</p>
            <div class="footer">
              <p>This is an automated email from Deadline Buddy.</p>
              <p>Happy organizing! 🎯</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `Welcome to Deadline Buddy!\n\nHi there!\n\nWelcome to Deadline Buddy! We're excited to help you stay on top of your deadlines.\n\nWhat happens next?\n- Add your tasks and deadlines\n- Get automatic email reminders for tasks due within 7 days\n- Stay organized and never miss a deadline!\n\nEmail Reminders:\nYou'll receive automatic email reminders at ${userEmail} for any tasks due within the next 7 days. Reminders are sent daily at 9:00 AM.\n\nHappy organizing!`;

    const mailOptions = {
      from: `"Deadline Buddy" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "🎉 Welcome to Deadline Buddy!",
      text: textContent,
      html: emailContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${userEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
};

// Send deadline reminder email
const sendDeadlineReminder = async (userEmail, userName, tasks) => {
  try {
    const transporter = createTransporter();

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("Email credentials not configured. Skipping email send.");
      return { success: false, error: "Email not configured" };
    }

    // Group tasks by urgency
    const todayTasks = tasks.filter((task) => {
      const taskDate = new Date(task.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });

    const tomorrowTasks = tasks.filter((task) => {
      const taskDate = new Date(task.date);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === tomorrow.getTime();
    });

    const upcomingTasks = tasks.filter((task) => {
      const taskDate = new Date(task.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      taskDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
      return daysUntil > 1 && daysUntil <= 7;
    });

    // Build email content
    let emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00F5D4, #00D4AA); color: #1A1A2E; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .task-item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #00F5D4; }
          .task-title { font-weight: bold; color: #1A1A2E; font-size: 16px; }
          .task-meta { color: #666; font-size: 14px; margin-top: 5px; }
          .priority-high { border-left-color: #FF6384; }
          .priority-medium { border-left-color: #FFCE56; }
          .priority-low { border-left-color: #4BC0C0; }
          .section { margin: 20px 0; }
          .section-title { color: #1A1A2E; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Deadline Reminder - Deadline Buddy</h1>
          </div>
          <div class="content">
            <p>Hi ${userName || "there"},</p>
            <p>You have upcoming deadlines that need your attention!</p>
    `;

    // Today's tasks
    if (todayTasks.length > 0) {
      emailContent += `
        <div class="section">
          <div class="section-title">🚨 Due Today (${todayTasks.length})</div>
      `;
      todayTasks.forEach((task) => {
        emailContent += `
          <div class="task-item priority-${task.priority}">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
              Subject: ${task.subject} | Priority: ${task.priority.toUpperCase()}
            </div>
          </div>
        `;
      });
      emailContent += `</div>`;
    }

    // Tomorrow's tasks
    if (tomorrowTasks.length > 0) {
      emailContent += `
        <div class="section">
          <div class="section-title">⏰ Due Tomorrow (${tomorrowTasks.length})</div>
      `;
      tomorrowTasks.forEach((task) => {
        emailContent += `
          <div class="task-item priority-${task.priority}">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
              Subject: ${task.subject} | Priority: ${task.priority.toUpperCase()}
            </div>
          </div>
        `;
      });
      emailContent += `</div>`;
    }

    // Upcoming tasks (within 7 days)
    if (upcomingTasks.length > 0) {
      emailContent += `
        <div class="section">
          <div class="section-title">📋 Upcoming This Week (${upcomingTasks.length})</div>
      `;
      upcomingTasks.forEach((task) => {
        const taskDate = new Date(task.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);
        const daysUntil = Math.ceil(
          (taskDate - today) / (1000 * 60 * 60 * 24)
        );
        emailContent += `
          <div class="task-item priority-${task.priority}">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
              Subject: ${task.subject} | Due in ${daysUntil} days | Priority: ${task.priority.toUpperCase()}
            </div>
          </div>
        `;
      });
      emailContent += `</div>`;
    }

    emailContent += `
            <p style="margin-top: 30px;">
              <a href="${process.env.APP_URL || "http://localhost:3000"}/dashboard" 
                 style="background: #00F5D4; color: #1A1A2E; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Dashboard
              </a>
            </p>
            <div class="footer">
              <p>This is an automated reminder from Deadline Buddy.</p>
              <p>Stay on top of your deadlines! 🎯</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    let textContent = `Deadline Reminder - Deadline Buddy\n\n`;
    textContent += `Hi ${userName || "there"},\n\n`;
    textContent += `You have upcoming deadlines that need your attention!\n\n`;

    if (todayTasks.length > 0) {
      textContent += `Due Today (${todayTasks.length}):\n`;
      todayTasks.forEach(
        (task) =>
          (textContent += `- ${task.title} (${task.subject}) - Priority: ${task.priority}\n`)
      );
      textContent += `\n`;
    }

    if (tomorrowTasks.length > 0) {
      textContent += `Due Tomorrow (${tomorrowTasks.length}):\n`;
      tomorrowTasks.forEach(
        (task) =>
          (textContent += `- ${task.title} (${task.subject}) - Priority: ${task.priority}\n`)
      );
      textContent += `\n`;
    }

    if (upcomingTasks.length > 0) {
      textContent += `Upcoming This Week (${upcomingTasks.length}):\n`;
      upcomingTasks.forEach((task) => {
        const taskDate = new Date(task.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);
        const daysUntil = Math.ceil(
          (taskDate - today) / (1000 * 60 * 60 * 24)
        );
        textContent += `- ${task.title} (${task.subject}) - Due in ${daysUntil} days - Priority: ${task.priority}\n`;
      });
    }

    const mailOptions = {
      from: `"Deadline Buddy" <${process.env.EMAIL_USER}>`,
      to: userEmail, // ✅ Sends to the user's registered email address
      subject: `📅 Deadline Reminder: ${tasks.length} Upcoming Task${tasks.length > 1 ? "s" : ""}`,
      text: textContent,
      html: emailContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`   📧 Email sent to ${userEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendDeadlineReminder,
};


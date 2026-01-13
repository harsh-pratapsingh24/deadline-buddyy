# Email Reminder Setup Guide

Deadline Buddy now sends automatic email reminders for upcoming deadlines! Here's how to set it up.

## 📧 Email Configuration

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to your Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Add to your `.env` file**:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
APP_URL=http://localhost:3000
```

### Option 2: Other Email Services

For other SMTP services (Outlook, Yahoo, custom SMTP), update the transporter in `utils/emailService.js`:

```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
APP_URL=http://localhost:3000
```

## ⏰ How It Works

- **Automatic Daily Check**: The system checks for upcoming deadlines every day at 9:00 AM
- **Reminder Range**: Sends emails for tasks due within the next 7 days
- **Smart Grouping**: Groups tasks by urgency (Due Today, Due Tomorrow, Upcoming This Week)
- **Duplicate Prevention**: Won't send multiple emails for the same tasks on the same day
- **Priority Highlighting**: Shows task priority in the email

## 🧪 Testing

### Manual Test (While Logged In)

You can manually trigger a reminder check by making a POST request:

```bash
POST http://localhost:3000/api/email/test-reminders
```

Or use the browser console:
```javascript
fetch('/api/email/test-reminders', {
  method: 'POST',
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

### Test Immediately on Startup

To test immediately when the server starts, uncomment this line in `utils/emailScheduler.js`:

```javascript
// Uncomment to test immediately
checkAndSendReminders();
```

## 📝 Email Schedule

- **Default**: Every day at 9:00 AM (server timezone)
- **Timezone**: Currently set to "America/New_York" - change in `utils/emailScheduler.js` if needed
- **Custom Schedule**: Modify the cron expression in `utils/emailScheduler.js`:
  - `"0 9 * * *"` = 9:00 AM daily
  - `"0 9,18 * * *"` = 9:00 AM and 6:00 PM daily
  - `"0 */6 * * *"` = Every 6 hours

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Use App Passwords for Gmail (not your regular password)
- For production, consider using environment variables from your hosting provider

## 📬 Email Content

The emails include:
- Tasks due today (highlighted)
- Tasks due tomorrow
- Tasks due within the next 7 days
- Task priority indicators
- Direct link to dashboard
- Beautiful HTML formatting with fallback plain text

## 🐛 Troubleshooting

**Emails not sending?**
1. Check that `EMAIL_USER` and `EMAIL_PASSWORD` are set in `.env`
2. Verify your email credentials are correct
3. Check server logs for error messages
4. For Gmail, ensure you're using an App Password (not regular password)

**Not receiving emails?**
1. Check spam folder
2. Verify email address in user account
3. Check server logs to see if emails were sent
4. Ensure tasks have valid dates

**Want to change email frequency?**
- Edit the cron schedule in `utils/emailScheduler.js`
- Use [crontab.guru](https://crontab.guru) to generate cron expressions


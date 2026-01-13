# Testing Email Reminders - Quick Guide

## Step 1: Set Up Email Credentials

1. **Create a `.env` file** in the project root (if you don't have one):

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/deadline_buddy
   SESSION_SECRET=your-secret-key-here
   PORT=3000

   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   APP_URL=http://localhost:3000
   ```

2. **For Gmail Setup:**
   - Go to your Google Account: https://myaccount.google.com
   - Security → 2-Step Verification (enable if not already)
   - Go to App Passwords: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)" → Enter "Deadline Buddy"
   - Copy the 16-character password
   - Paste it in `.env` as `EMAIL_PASSWORD`

## Step 2: Test Methods

### Method 1: Manual Test via Browser Console (Easiest)

1. **Start your server:**

   ```bash
   npm start
   ```

2. **Login to your account** in the browser

3. **Open Browser Console** (F12 or Right-click → Inspect → Console)

4. **Run this command:**

   ```javascript
   fetch("/api/email/test-reminders", {
     method: "POST",
     credentials: "include",
   })
     .then((r) => r.json())
     .then((data) => {
       console.log("Result:", data);
       alert("Check server logs and your email!");
     })
     .catch((err) => console.error("Error:", err));
   ```

5. **Check:**
   - Server console for logs
   - Your email inbox (and spam folder)

### Method 2: Test Immediately on Server Start

1. **Open `utils/emailScheduler.js`**

2. **Find line 95** and uncomment it:

   ```javascript
   // Uncomment to test immediately
   checkAndSendReminders();
   ```

3. **Make sure you have:**

   - At least one incomplete task
   - Task due date within the next 7 days

4. **Restart server:**

   ```bash
   npm start
   ```

5. **Check your email** - it should send immediately!

6. **Remember to comment it back** after testing to avoid sending emails every time you restart.

### Method 3: Using Postman or curl

**With curl (command line):**

```bash
# First, login and get session cookie, then:
curl -X POST http://localhost:3000/api/email/test-reminders \
  -H "Content-Type: application/json" \
  -b "connect.sid=YOUR_SESSION_COOKIE" \
  -c cookies.txt
```

**With Postman:**

- Method: POST
- URL: `http://localhost:3000/api/email/test-reminders`
- Headers: `Content-Type: application/json`
- Include session cookie from your browser

## Step 3: What to Check

### ✅ Server Logs Should Show:

```
📧 Checking for upcoming deadlines and sending email reminders...
Found X incomplete task(s) to check.

📬 Sending reminder email to: your-email@example.com (X upcoming task(s))
   📧 Email sent to your-email@example.com (Message ID: ...)
✅ Email successfully sent to: your-email@example.com

📊 Email Reminder Summary:
   ✅ Emails sent: 1
   ⏭️  Emails skipped: 0
   👥 Total users checked: 1
```

### ✅ Your Email Should Have:

- Subject: "📅 Deadline Reminder: X Upcoming Task(s)"
- Tasks grouped by urgency (Due Today, Due Tomorrow, Upcoming This Week)
- Priority indicators
- Link to dashboard

## Step 4: Troubleshooting

### ❌ "Email credentials not configured"

- Check that `EMAIL_USER` and `EMAIL_PASSWORD` are in `.env`
- Restart server after adding to `.env`

### ❌ "Failed to send email"

- Verify Gmail App Password is correct (16 characters, no spaces)
- Check 2-Step Verification is enabled
- Try using your regular Gmail password (if App Password doesn't work)
- Check server logs for specific error

### ❌ "No upcoming deadlines"

- Create a task with due date within 7 days
- Make sure task is not marked as completed

### ❌ Email not received

- Check spam/junk folder
- Verify email address in your account
- Check server logs to confirm email was sent
- Wait a few minutes (email delivery can be delayed)

## Step 5: Test Different Scenarios

1. **Test with multiple tasks:**

   - Create 2-3 tasks with different due dates
   - Run test
   - Verify all tasks appear in email

2. **Test with tasks due today:**

   - Create task with today's date
   - Should appear in "Due Today" section

3. **Test with tasks due tomorrow:**

   - Create task with tomorrow's date
   - Should appear in "Due Tomorrow" section

4. **Test duplicate prevention:**
   - Run test twice in same day
   - Second run should skip (already sent today)

## Quick Test Checklist

- [ ] `.env` file created with email credentials
- [ ] Server restarted after adding credentials
- [ ] At least one incomplete task exists
- [ ] Task due date is within 7 days
- [ ] Test command executed
- [ ] Server logs show email sent
- [ ] Email received in inbox (check spam too!)

## Need Help?

If emails aren't sending:

1. Check server console for error messages
2. Verify `.env` file is in project root
3. Make sure you restarted server after adding credentials
4. Try a different email service (Outlook, Yahoo, etc.)

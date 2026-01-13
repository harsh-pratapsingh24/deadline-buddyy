# Quick Email Setup Guide

## Step 1: Create `.env` File

I've created a `.env` file for you. Now you need to add your email credentials.

## Step 2: Get Gmail App Password

### Option A: Gmail (Recommended)

1. **Go to Google Account Settings:**

   - Visit: https://myaccount.google.com/security

2. **Enable 2-Step Verification** (if not already enabled):

   - Click "2-Step Verification"
   - Follow the setup process

3. **Generate App Password:**

   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" from the dropdown
   - Select "Other (Custom name)"
   - Enter: "Deadline Buddy"
   - Click "Generate"
   - **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

4. **Add to `.env` file:**

   - Open `.env` file in the project root
   - Replace `your-email@gmail.com` with your actual Gmail address
   - Replace `your-16-character-app-password-here` with the password you copied
   - **Remove spaces** from the password (it should be 16 characters without spaces)

   Example:

   ```env
   EMAIL_USER=myemail@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   ```

### Option B: Other Email Services

If you want to use a different email service, you'll need to modify the email service configuration. For now, Gmail is the easiest option.

## Step 3: Restart Server

After updating `.env`:

1. Stop your server (Ctrl+C)
2. Start it again: `npm start`

## Step 4: Test

1. Click "Test My Email" button on Dashboard
2. Check your email inbox (and spam folder)

## Troubleshooting

### "Email credentials not configured"

- Make sure `.env` file exists in project root
- Check that `EMAIL_USER` and `EMAIL_PASSWORD` are set
- Restart server after editing `.env`

### "Failed to send email"

- Verify App Password is correct (16 characters, no spaces)
- Make sure 2-Step Verification is enabled
- Check server console for specific error messages

### Still not working?

- Check server console logs for detailed error messages
- Verify your Gmail account allows "Less secure app access" (if using regular password)
- Try generating a new App Password

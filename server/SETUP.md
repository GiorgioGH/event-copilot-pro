# Email Server Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Gmail App Password:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device, then click "Generate"
   - Copy the 16-character password

3. **Create `.env` file in `server/` directory:**
   ```bash
   cd server
   ```
   
   Create a file named `.env` with:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   EMAIL_SERVER_PORT=3001
   ```

4. **Start the email server:**
   ```bash
   npm run email-server
   ```

5. **In a separate terminal, start your Vite dev server:**
   ```bash
   npm run dev
   ```

## Testing

Once both servers are running, you can test sending an email from the Communication tab in your app. The email will be sent directly via Gmail!

## Troubleshooting

- **"Invalid login"**: Make sure you're using an App Password (16 characters), not your regular Gmail password
- **"Connection refused"**: Make sure the email server is running on port 3001
- **Port conflict**: Change `EMAIL_SERVER_PORT` in your `.env` file to a different port


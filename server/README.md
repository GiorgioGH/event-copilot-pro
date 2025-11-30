# Local Email Server

This server handles sending emails via Gmail using nodemailer. It runs locally alongside your Vite dev server.

## Setup Instructions

### Method 1: Gmail App Password (Recommended for Local Development)

1. **Enable 2-Step Verification:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password:**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-character password (spaces don't matter)

3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env` in the `server/` directory
   - Fill in your Gmail credentials:
     ```
     GMAIL_USER=your-email@gmail.com
     GMAIL_APP_PASSWORD=your-16-character-app-password
     ```

### Method 2: OAuth2 (More Secure)

1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing

2. **Enable Gmail API:**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it

3. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3001/oauth2callback`
   - Save Client ID and Client Secret

4. **Get Refresh Token:**
   - Use [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
   - Select "Gmail API v1" > "https://mail.google.com/"
   - Authorize and get refresh token

5. **Configure Environment Variables:**
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_CLIENT_ID=your-client-id
   GMAIL_CLIENT_SECRET=your-client-secret
   GMAIL_REFRESH_TOKEN=your-refresh-token
   ```

## Running the Server

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the email server:**
   ```bash
   npm run email-server
   ```

   Or manually:
   ```bash
   node server/email-server.js
   ```

3. **The server will run on:** `http://localhost:3001`

## Testing

You can test the email server with:

```bash
curl -X POST http://localhost:3001/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test message"
  }'
```

## Troubleshooting

- **"Invalid login"**: Make sure you're using an App Password, not your regular Gmail password
- **"Less secure app access"**: Use App Passwords instead (recommended)
- **Port already in use**: Change `EMAIL_SERVER_PORT` in `.env` to a different port


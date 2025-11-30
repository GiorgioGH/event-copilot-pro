# Send Email Function

This Supabase Edge Function sends emails to vendors and sponsors via Gmail API.

## Setup Instructions

### Option 1: Gmail API (Recommended)

1. **Create a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Gmail API:**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it

3. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000` (for local development)
     - Your production domain
   - Save the Client ID and Client Secret

4. **Get Refresh Token:**
   - Use the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
   - Select "Gmail API v1" > "https://mail.google.com/"
   - Authorize and get the refresh token

5. **Set Environment Variables in Supabase:**
   ```bash
   supabase secrets set GMAIL_CLIENT_ID=your_client_id
   supabase secrets set GMAIL_CLIENT_SECRET=your_client_secret
   supabase secrets set GMAIL_REFRESH_TOKEN=your_refresh_token
   supabase secrets set GMAIL_USER_EMAIL=your_gmail_address@gmail.com
   ```

### Option 2: Fallback (No Setup Required)

If Gmail API is not configured, the function will return a `mailto:` link that opens the user's default email client with the message pre-filled.

## Usage

The function accepts a POST request with the following JSON body:

```json
{
  "to": "vendor@example.com",
  "subject": "Event Inquiry",
  "body": "Hello, I'm interested in...",
  "fromEmail": "your@email.com",
  "fromName": "Your Name"
}
```

## Testing

You can test the function locally:

```bash
supabase functions serve send-email
```

Then make a POST request:

```bash
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test message"
  }'
```


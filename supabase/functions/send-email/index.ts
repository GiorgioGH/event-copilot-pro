import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  fromEmail?: string;
  fromName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, body, fromEmail, fromName }: EmailRequest = await req.json();

    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Gmail API credentials from environment
    const GMAIL_CLIENT_ID = Deno.env.get("GMAIL_CLIENT_ID");
    const GMAIL_CLIENT_SECRET = Deno.env.get("GMAIL_CLIENT_SECRET");
    const GMAIL_REFRESH_TOKEN = Deno.env.get("GMAIL_REFRESH_TOKEN");
    const GMAIL_USER_EMAIL = Deno.env.get("GMAIL_USER_EMAIL") || fromEmail;

    // If Gmail API is configured, use it
    if (GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN && GMAIL_USER_EMAIL) {
      try {
        // Get access token using refresh token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GMAIL_CLIENT_ID,
            client_secret: GMAIL_CLIENT_SECRET,
            refresh_token: GMAIL_REFRESH_TOKEN,
            grant_type: 'refresh_token',
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to refresh Gmail access token');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Create email message in RFC 2822 format
        const emailMessage = [
          `To: ${to}`,
          `From: ${fromName ? `${fromName} <${GMAIL_USER_EMAIL}>` : GMAIL_USER_EMAIL}`,
          `Subject: ${subject}`,
          'Content-Type: text/plain; charset=utf-8',
          '',
          body,
        ].join('\n');

        // Encode message in base64url format
        const encodedMessage = btoa(emailMessage)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        // Send email via Gmail API
        const gmailResponse = await fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              raw: encodedMessage,
            }),
          }
        );

        if (!gmailResponse.ok) {
          const errorText = await gmailResponse.text();
          console.error('Gmail API error:', errorText);
          throw new Error(`Gmail API error: ${gmailResponse.status}`);
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Email sent via Gmail API' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (gmailError) {
        console.error('Gmail API error:', gmailError);
        // Fall through to mailto: fallback
      }
    }

    // Fallback: Return mailto: link if Gmail API is not configured
    // The frontend can use this to open the user's email client
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}${fromEmail ? `&from=${encodeURIComponent(fromEmail)}` : ''}`;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Gmail API not configured. Use mailto: link.',
        mailtoLink,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Email sending error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


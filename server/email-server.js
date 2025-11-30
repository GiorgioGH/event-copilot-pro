import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix path so dotenv loads server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log("ENV LOADED:", {
  user: process.env.GMAIL_USER,
  pass: process.env.GMAIL_APP_PASSWORD,
});

const app = express();
const PORT = process.env.EMAIL_SERVER_PORT || 3001;

app.use(cors());
app.use(express.json());

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  // Option 1: Using Gmail App Password (Recommended for local dev)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // App Password, not regular password
      },
    });
  }

  // Option 2: Using OAuth2 (More secure, but requires setup)
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });
  }

  throw new Error('Gmail credentials not configured. Please set up Gmail authentication in .env file.');
};

// Email sending endpoint
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, body, fromEmail, fromName } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        error: 'Missing required fields: to, subject, body',
      });
    }

    const transporter = createTransporter();
    const gmailUser = process.env.GMAIL_USER;

    const mailOptions = {
      from: fromName 
        ? `${fromName} <${gmailUser}>`
        : gmailUser,
      to: to,
      subject: subject,
      text: body,
      replyTo: fromEmail || gmailUser,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: error.message || 'Failed to send email',
      details: error.toString(),
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'email-server' });
});

app.listen(PORT, () => {
  console.log(`Email server running on http://localhost:${PORT}`);
  console.log('Make sure Gmail credentials are configured in .env file');
});


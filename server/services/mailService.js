import nodemailer from "nodemailer";

const isProd = process.env.NODE_ENV === "PROD";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.RND_EMAIL,
    pass: process.env.RND_APP_PASSWD,
  },
});

export async function dispatchEmail(to, subject, html, attachment = null) {
  if (isProd) {
    if (!process.env.GOOGLE_MAIL_WEBHOOK) {
      throw new Error("Missing GOOGLE_MAIL_WEBHOOK in Render environment variables");
    }
    
    // Payload for Google Apps Script
    const payload = { to, subject, html };
    if (attachment) {
      payload.attachment = attachment; // Expects { name, base64, mimeType }
    }

    const response = await fetch(process.env.GOOGLE_MAIL_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    if (!result.success) throw new Error("Google Webhook Failed: " + result.error);
    
  } else {
    // Local Nodemailer execution
    const mailOptions = {
      from: `"R&D Department" <${process.env.RND_EMAIL}>`,
      to,
      subject,
      html,
    };

    if (attachment) {
      mailOptions.attachments = [
        {
          filename: attachment.name,
          content: attachment.base64,
          encoding: "base64",
        }
      ];
    }

    await transporter.sendMail(mailOptions);
  }
}
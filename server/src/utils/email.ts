import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_EMAIL,
    pass: env.SMTP_PASSWORD,
  },
});

// ─── Send OTP Email ───
export async function sendOtpEmail(to: string, otp: string, purpose: "verify" | "reset") {
  const subject =
    purpose === "verify"
      ? "Verify Your Email - eBay"
      : "Password Reset OTP - eBay";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
      <h2 style="color: #2563eb; text-align: center; margin-bottom: 8px;">eBay</h2>
      <p style="color: #374151; text-align: center; font-size: 16px;">
        ${purpose === "verify" ? "Verify your email address" : "Reset your password"}
      </p>
      <div style="background: #ffffff; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin-bottom: 12px; font-size: 14px;">Your OTP code is:</p>
        <h1 style="color: #1f2937; letter-spacing: 8px; font-size: 36px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #9ca3af; text-align: center; font-size: 13px;">
        This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"eBay" <${env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  });
}

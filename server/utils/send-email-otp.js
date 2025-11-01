import nodemailer from "nodemailer";
import logger from "./logger.js";
const sendEmailOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"11Jersey.com Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Password Reset",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #004aad; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">11Jersey.com</h1>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px;">Hello,</p>
              <p style="font-size: 16px;">You requested a password reset for your 11Jersey.com account.</p>
              <p style="font-size: 18px; font-weight: bold; margin: 20px 0;">
                Your One-Time Password (OTP) is:<br />
                <span style="font-size: 28px; color: #004aad;">${otp}</span>
              </p>
              <p style="font-size: 16px;">Please use this OTP to reset your password. It is valid for <strong>10 minutes</strong>.</p>
              <p style="font-size: 16px;">If you did not request this, please ignore this email.</p>
              <p style="font-size: 16px;">Thank you for choosing <strong>11Jersey.com</strong>!</p>
              <p style="font-size: 14px; color: #777; margin-top: 40px;">© 11Jersey.com</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    logger.error(`Failed to send OTP to ${email}: ${error.message}`);
    throw new Error("Failed to send OTP");
  }
};

export default sendEmailOTP;

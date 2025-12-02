export const verifyEmailChangeTemplate = (otp) => `
  <p>Dear User,</p>
  <p>We received a request to update the email address associated with your <strong>11Jersey.com</strong> account.</p>
  <p>Please use the One-Time Password (OTP) below to verify this change:</p>
  <h2 style="letter-spacing: 4px; font-size: 28px; margin: 12px 0;">${otp}</h2>
  <p>This OTP is valid for the next <strong>10 minutes</strong>.</p>
  <p>If you did not initiate this request, please ignore this message or contact our support team immediately.</p>
  <br/>
  <p>Warm regards,<br/><strong>11Jersey.com Support Team</strong></p>
`;

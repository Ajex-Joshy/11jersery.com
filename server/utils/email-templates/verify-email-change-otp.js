export const verifyEmailChangeTemplate = (otp) => `
  <p>Dear User,</p>
  <p>We received a request to update the email address associated with your account.</p>
  <p>Your One-Time Password (OTP) to verify this change is:</p>
  <h2 style="letter-spacing: 4px;">${otp}</h2>
  <p>This OTP will remain valid for the next 10 minutes.</p>
  <p>If you did not request this change, please ignore this message or contact our support team immediately.</p>
  <br/>
  <p>Warm regards,<br/>11Jersey Support Team</p>
`;

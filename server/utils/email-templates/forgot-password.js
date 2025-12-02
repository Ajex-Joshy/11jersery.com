export const forgotPasswordTemplate = (resetUrl, userName = "User") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #007bff;
      color: #ffffff;
      padding: 20px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 30px 20px;
    }
    .content h2 {
      font-size: 20px;
      margin-bottom: 15px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      font-size: 16px;
      color: #ffffff;
      background-color: #28a745;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
    }
    .footer {
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #777777;
      background-color: #f1f1f1;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      11jersey.com
    </div>
    <div class="content">
      <h2>Hello ${userName},</h2>
      <p>We received a request to reset your password for your 11jersey.com account.</p>
      <p>Click the button below to reset your password. This link is valid for <strong>1 hour</strong>.</p>
      <p style="text-align:center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </p>
      <p>If you did not request a password reset, please ignore this email or contact our support team if you have questions.</p>
      <p>Thank you,<br />The 11jersey.com Team</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} 11jersey.com. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

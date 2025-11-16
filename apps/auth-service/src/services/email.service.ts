interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string
  ): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
            <div class="warning">
              <strong>⚠️ Security Note:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 AI Chatbot Platform. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hi ${userName},

We received a request to reset your password.

Click this link to reset your password: ${resetLink}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

© 2025 AI Chatbot Platform
    `.trim();

    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request - AI Chatbot Platform',
      html,
      text,
    });
  }

  /**
   * Send email (mock implementation for now)
   * In production, replace with actual email service (SendGrid, AWS SES, etc.)
   */
  private static async sendEmail(options: EmailOptions): Promise<void> {
    // Mock implementation - log to console
    console.log('📧 Email would be sent:', {
      to: options.to,
      subject: options.subject,
      preview: options.text?.substring(0, 100),
    });

    // In production, use a real email service:
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: options.to,
    //   from: process.env.FROM_EMAIL,
    //   subject: options.subject,
    //   text: options.text,
    //   html: options.html,
    // });

    // For now, simulate sending
    return Promise.resolve();
  }

  /**
   * Send welcome email (optional)
   */
  static async sendWelcomeEmail(
    email: string,
    userName: string
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to AI Chatbot Platform! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Thank you for signing up! We're excited to have you on board.</p>
            <p>You can now start using our AI-powered chatbot to enhance your productivity.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to AI Chatbot Platform!',
      html,
    });
  }
}

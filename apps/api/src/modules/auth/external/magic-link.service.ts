import { injectable } from "inversify";
import { Resend } from "resend";
import { EMAIL_SERVICE_CONFIG } from "../../../shared/config/email-service.config";

export interface MagicLinkEmailData {
  email: string;
  token: string;
  type: "signup" | "signin";
  expiresIn: number; // minutes
}

@injectable()
export class MagicLinkService {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(EMAIL_SERVICE_CONFIG.RESEND_API_KEY);
  }

  async sendMagicLinkEmail(data: MagicLinkEmailData): Promise<void> {
    const magicLink = this.buildMagicLink(data.token);
    const subject =
      data.type === "signup"
        ? "Complete your signup"
        : "Sign in to your account";
    const html = this.buildEmailTemplate(data.type, magicLink, data.expiresIn);

    try {
      await this.resend.emails.send({
        from: EMAIL_SERVICE_CONFIG.FROM_EMAIL,
        to: [data.email],
        subject,
        html,
      });
    } catch (error) {
      console.error("Failed to send magic link email:", error);
      throw new Error("Failed to send verification email");
    }
  }

  private buildMagicLink(token: string): string {
    return `${EMAIL_SERVICE_CONFIG.FRONTEND_URL}/auth/verify?token=${token}`;
  }

  private buildEmailTemplate(
    type: "signup" | "signin",
    magicLink: string,
    expiresIn: number,
  ): string {
    const serviceName = EMAIL_SERVICE_CONFIG.SERVICE_NAME;
    const action = type === "signup" ? "complete your signup" : "sign in";
    const title =
      type === "signup"
        ? "Welcome to " + serviceName
        : "Sign in to " + serviceName;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #ffffff;
      border-radius: 8px;
      padding: 40px;
      border: 1px solid #e5e5e5;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background: #1d4ed8;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      font-size: 14px;
      color: #666;
    }
    .expires {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 4px;
      padding: 12px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">${serviceName}</div>
      <h1>${title}</h1>
    </div>
    
    <p>Click the button below to ${action}:</p>
    
    <div style="text-align: center;">
      <a href="${magicLink}" class="button">
        ${type === "signup" ? "Complete Signup" : "Sign In"}
      </a>
    </div>
    
    <div class="expires">
      � This link will expire in ${expiresIn} minutes for security reasons.
    </div>
    
    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #2563eb;">
      <a href="${magicLink}">${magicLink}</a>
    </p>
    
    <div class="footer">
      <p>If you didn't request this email, you can safely ignore it.</p>
      <p>Best regards,<br>The ${serviceName} Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

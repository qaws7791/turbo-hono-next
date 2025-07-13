import { Resend } from "resend";
import { APP_CONFIG } from "../config/app.config";
import { EMAIL_SERVICE_CONFIG } from "../config/email-service.config";

export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(EMAIL_SERVICE_CONFIG.RESEND_API_KEY);
  }

  async sendMagicLink(
    email: string,
    token: string,
    type: "signup" | "signin",
  ): Promise<void> {
    const baseUrl = APP_CONFIG.FRONTEND_URL;
    const verifyUrl = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

    const subject =
      type === "signup"
        ? `${APP_CONFIG.SERVICE_NAME} 회원가입 인증`
        : `${APP_CONFIG.SERVICE_NAME} 로그인 인증`;
    const actionText = type === "signup" ? "회원가입 완료하기" : "로그인하기";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .button { 
              display: inline-block; 
              background: #007bff; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { background: #f8f9fa; padding: 20px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 ${APP_CONFIG.SERVICE_NAME}</h1>
              <p>로컬 크리에이터 스토리 아카이브 플랫폼</p>
            </div>
            <div class="content">
              <h2>${subject}</h2>
              <p>안녕하세요!</p>
              <p>아래 버튼을 클릭하여 ${actionText}를 완료해주세요.</p>
              <p style="text-align: center;">
                <a href="${verifyUrl}" class="button">${actionText}</a>
              </p>
              <p>이 링크는 10분간 유효합니다.</p>
              <p>만약 이 요청을 하지 않으셨다면, 이 이메일을 무시하셔도 됩니다.</p>
            </div>
            <div class="footer">
              <p>© 2025 ${APP_CONFIG.SERVICE_NAME}. All rights reserved.</p>
              <p>이 이메일은 자동으로 발송되었습니다.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.resend.emails.send({
      from: `${APP_CONFIG.SERVICE_NAME} <noreply@${APP_CONFIG.FRONTEND_URL}>`,
      to: email,
      subject,
      html,
    });
  }
}

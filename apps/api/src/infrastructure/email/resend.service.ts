import { env } from "@/common/config/env";
import { injectable } from "inversify";
import { Resend } from "resend";

@injectable()
export class ResendService {
  private readonly resend: Resend;
  private readonly EMAIL_FROM: string;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
    this.EMAIL_FROM = env.RESEND_EMAIL;
  }

  /**
   * 일반 이메일 발송
   */
  async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
  ): Promise<{ id: string }> {
    const { data, error } = await this.resend.emails.send({
      from: this.EMAIL_FROM,
      to,
      subject,
      html,
    });
    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      throw new Error("이메일 전송 결과가 없습니다.");
    }
    return data;
  }
}

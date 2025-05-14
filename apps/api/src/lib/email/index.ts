import { env } from "@/config/env";
import { Resend } from "resend";

const EMAIL_FROM = env.RESEND_EMAIL;

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async (
  to: string | string[],
  subject: string,
  html: string,
) => {
  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = `
    <p>아래 링크를 클릭하여 이메일 인증을 완료해주세요.</p>
    <a href="${verificationLink}">이메일 인증 링크</a>
  `;

  return sendEmail(to, "이메일 인증 요청", html);
};

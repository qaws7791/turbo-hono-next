export type AuthConfig = {
  readonly NODE_ENV: "development" | "test" | "production";
  readonly BASE_URL: string;
  readonly SESSION_DURATION_DAYS: number;

  readonly GOOGLE_CLIENT_ID?: string;
  readonly GOOGLE_CLIENT_SECRET?: string;

  readonly EMAIL_DELIVERY_MODE: "resend" | "log";
  readonly RESEND_API_KEY?: string;
  readonly RESEND_EMAIL?: string;
};

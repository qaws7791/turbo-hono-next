/// <reference path="./.sst/platform/config.d.ts" />


export default $config({
  app(input) {
    return {
      name: "api",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    new sst.aws.Function("Hono", {
      nodejs: {
        install: ["argon2"],
        esbuild: {
          external: ["argon2"],
        },
      },
      url: true,
      handler: "src/index.handler",
      environment: {
        NODE_ENV: $app.stage === 'main' ? 'production' : 'development',
        KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID as string,
        KAKAO_CLIENT_SECRET: process.env.KAKAO_CLIENT_SECRET as string,
        KAKAO_REDIRECT_URI: process.env.KAKAO_REDIRECT_URI as string,
        COOKIE_SECURE: process.env.COOKIE_SECURE as string,
        COOKIE_DOMAIN: process.env.COOKIE_DOMAIN as string,
        SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME as string,
        DATABASE_URL: process.env.DATABASE_URL as string,
        PASSWORD_HASH_SECRET: process.env.PASSWORD_HASH_SECRET as string,
        RESEND_API_KEY: process.env.RESEND_API_KEY as string,
        RESEND_EMAIL: process.env.RESEND_EMAIL as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string,
        R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID as string,
        R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID as string,
        R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY as string,
        R2_BUCKET_NAME: process.env.R2_BUCKET_NAME as string,
        R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL as string,
      },
    });
  },
});

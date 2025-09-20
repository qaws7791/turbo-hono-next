import { CONFIG } from ".";

export const authConfig = {
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
    cookieName: "session",
    cookieOptions: {
      httpOnly: true,
      secure: CONFIG.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days in milliseconds
    },
  },
  verification: {
    expiresIn: 60 * 60, // 1 hour in seconds
  },
  oauth: {
    github: {
      authorizationUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      userUrl: "https://api.github.com/user",
    },
  },
};

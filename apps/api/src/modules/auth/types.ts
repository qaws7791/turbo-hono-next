export type RequestContext = {
  readonly ipAddress?: string;
  readonly userAgent?: string;
};

export type AuthContext = {
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    locale: string;
    timezone: string;
    subscriptionPlan: "FREE" | "PRO";
  };
  session: {
    id: string;
    expiresAt: Date;
  };
};

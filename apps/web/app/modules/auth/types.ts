export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  locale: string;
  timezone: string;
};

export type AuthMeResponse = {
  data: AuthUser;
};

// Login View Types
export type LoginActionData =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string };

export type LoginViewState =
  | { view: "idle"; isSubmitting: boolean; errorMessage: string | null }
  | {
      view: "sent";
      isSubmitting: boolean;
      email: string;
      secondsLeft: number;
      canResend: boolean;
    };

import type { paths } from "~/types/api";

export type AuthMeResponse =
  paths["/api/auth/me"]["get"]["responses"][200]["content"]["application/json"];

export type AuthUser = AuthMeResponse["data"];

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

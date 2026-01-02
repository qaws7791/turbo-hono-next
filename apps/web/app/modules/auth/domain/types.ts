import type { AuthMeApiResponse } from "../api/schema";

export type AuthUser = AuthMeApiResponse["data"];

export type AuthMeResponse = AuthMeApiResponse;

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

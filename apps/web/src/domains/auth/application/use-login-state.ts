import * as React from "react";

import type { LoginActionData, LoginViewState } from "../model/types";

import { useCountdown } from "~/foundation/hooks/use-countdown";

export function useLoginState(input: {
  actionData: LoginActionData | undefined;
  isSubmitting: boolean;
}): {
  state: LoginViewState;
  resetToIdle: () => void;
} {
  const [forceIdle, setForceIdle] = React.useState(false);
  const view = forceIdle ? "idle" : (input.actionData?.status ?? "idle");

  const email =
    !forceIdle && view === "sent"
      ? (input.actionData as { email: string }).email
      : "";

  const errorMessage =
    !forceIdle && input.actionData?.status === "error"
      ? input.actionData.message
      : null;

  const secondsLeft = useCountdown(30, view === "sent");
  const canResend =
    view === "sent" && secondsLeft === 0 && input.isSubmitting === false;

  const state: LoginViewState =
    view === "sent"
      ? {
          view: "sent",
          isSubmitting: input.isSubmitting,
          email,
          secondsLeft,
          canResend,
        }
      : { view: "idle", isSubmitting: input.isSubmitting, errorMessage };

  return {
    state,
    resetToIdle: () => setForceIdle(true),
  };
}

import * as React from "react";
import { useSearchParams } from "react-router";

import { requestMagicLink } from "../api";

import type { LoginActionData, LoginViewState } from "../model/types";

import { useCountdown } from "~/foundation/hooks/use-countdown";

function safeRedirectTo(value: string | null): string {
  if (!value) return "/home";
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/home";
}

export function useMagicLinkLogin() {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [actionData, setActionData] = React.useState<
    LoginActionData | undefined
  >(undefined);
  const [forceIdle, setForceIdle] = React.useState(false);

  const sendMagicLink = React.useCallback(
    async (email: string) => {
      setIsSubmitting(true);
      setActionData(undefined);
      setForceIdle(false);

      const redirectPath = safeRedirectTo(searchParams.get("redirectTo"));

      try {
        await requestMagicLink({ email, redirectPath });
        setActionData({ status: "sent", email });
      } catch {
        setActionData({
          status: "error",
          message: "이메일 형식을 확인하세요.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [searchParams],
  );

  const view = forceIdle ? "idle" : (actionData?.status ?? "idle");

  const email =
    !forceIdle && view === "sent"
      ? (actionData as { email: string }).email
      : "";

  const errorMessage =
    !forceIdle && actionData?.status === "error" ? actionData.message : null;

  const secondsLeft = useCountdown(30, view === "sent");
  const canResend =
    view === "sent" && secondsLeft === 0 && isSubmitting === false;

  const state: LoginViewState =
    view === "sent"
      ? {
          view: "sent",
          isSubmitting,
          email,
          secondsLeft,
          canResend,
        }
      : { view: "idle", isSubmitting, errorMessage };

  return {
    state,
    sendMagicLink,
    resetToIdle: () => setForceIdle(true),
  };
}

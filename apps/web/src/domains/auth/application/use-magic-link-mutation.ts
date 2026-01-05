import * as React from "react";
import { useSearchParams } from "react-router";

import { requestMagicLink } from "../api";

import type { LoginActionData } from "../model/types";

function safeRedirectTo(value: string | null): string {
  if (!value) return "/home";
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/home";
}

export type MagicLinkMutationState = {
  isSubmitting: boolean;
  actionData: LoginActionData | undefined;
};

export function useMagicLinkMutation(): MagicLinkMutationState & {
  sendMagicLink: (email: string) => void;
} {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [actionData, setActionData] = React.useState<
    LoginActionData | undefined
  >(undefined);

  const sendMagicLink = React.useCallback(
    async (email: string) => {
      setIsSubmitting(true);
      setActionData(undefined);

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

  return { isSubmitting, actionData, sendMagicLink };
}

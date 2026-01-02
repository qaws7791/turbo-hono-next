import { redirect, useActionData, useNavigation } from "react-router";

import type { Route } from "./+types/login";
import type { LoginActionData } from "~/features/auth/login/types";

import { LoginView } from "~/features/auth/login/login-view";
import { useLoginViewModel } from "~/features/auth/login/use-login-view-model";
import { authStatus, requestMagicLink, signInWithGoogle } from "~/mock/api";

function safeRedirectTo(value: string | null): string {
  if (!value) return "/home";
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/home";
}

export function meta() {
  return [{ title: "로그인" }];
}

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { isAuthenticated } = authStatus();
  if (isAuthenticated) {
    throw redirect("/home");
  }

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo");
  return { redirectTo };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  const url = new URL(request.url);
  const redirectTo = safeRedirectTo(url.searchParams.get("redirectTo"));

  if (intent === "google") {
    signInWithGoogle();
    throw redirect(redirectTo);
  }

  if (intent === "magiclink") {
    const email = String(formData.get("email") ?? "");
    try {
      const { email: validated } = requestMagicLink(email);
      return { status: "sent", email: validated } satisfies LoginActionData;
    } catch {
      return {
        status: "error",
        message: "이메일 형식을 확인하세요.",
      } satisfies LoginActionData;
    }
  }

  return {
    status: "error",
    message: "요청을 처리할 수 없습니다.",
  } satisfies LoginActionData;
}

export default function LoginRoute() {
  const actionData = useActionData<typeof clientAction>() as
    | LoginActionData
    | undefined;
  const navigation = useNavigation();

  const model = useLoginViewModel({
    actionData,
    isSubmitting: navigation.state !== "idle",
  });

  return <LoginView state={model.state} onChangeEmail={model.resetToIdle} />;
}


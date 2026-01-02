import { redirect, useActionData, useNavigation } from "react-router";

import type { LoginActionData } from "~/modules/auth";
import type { Route } from "./+types/login";

import {
  LoginView,
  fetchAuthMeOrNull,
  sendMagicLink,
  startGoogleAuth,
} from "~/modules/auth";
import { safeRedirectTo } from "~/lib/auth";

export function meta() {
  return [{ title: "로그인" }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const me = await fetchAuthMeOrNull();
  if (me) throw redirect("/home");

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
    startGoogleAuth({ redirectPath: redirectTo });
    return null;
  }

  if (intent === "magiclink") {
    const email = String(formData.get("email") ?? "");
    try {
      await sendMagicLink({ email, redirectPath: redirectTo });
      return { status: "sent", email } satisfies LoginActionData;
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
  const actionData = useActionData<typeof clientAction>();
  const navigation = useNavigation();

  // 현재 제출 중인 intent를 추출 (google 또는 magiclink)
  const submittingIntent =
    navigation.state !== "idle"
      ? (navigation.formData?.get("intent")?.toString() ?? null)
      : null;

  return (
    <LoginView
      actionData={actionData ?? undefined}
      submittingIntent={submittingIntent}
    />
  );
}

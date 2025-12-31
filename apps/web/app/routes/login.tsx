import { redirect, useActionData, useNavigation } from "react-router";

import type { LoginActionData } from "~/modules/auth";
import type { Route } from "./+types/login";

import {
  LoginView,
  buildGoogleAuthUrl,
  fetchAuthMe,
  postMagicLink,
} from "~/modules/auth";

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

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  try {
    await fetchAuthMe();
    throw redirect("/home");
  } catch (error) {
    // 인증되지 않은 경우 - 로그인 페이지를 보여줌
    if (error instanceof Response) throw error; // redirect는 다시 throw
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
    window.location.assign(buildGoogleAuthUrl({ redirectPath: redirectTo }));
    return null;
  }

  if (intent === "magiclink") {
    const email = String(formData.get("email") ?? "");
    try {
      await postMagicLink({ email, redirectPath: redirectTo });
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
  const actionData = useActionData<typeof clientAction>() as
    | LoginActionData
    | undefined;
  const navigation = useNavigation();

  // 현재 제출 중인 intent를 추출 (google 또는 magiclink)
  const submittingIntent =
    navigation.state !== "idle"
      ? (navigation.formData?.get("intent")?.toString() ?? null)
      : null;

  return (
    <LoginView
      actionData={actionData}
      submittingIntent={submittingIntent}
    />
  );
}

import { redirect } from "react-router";

import type { Route } from "./+types/login";

import { LoginView, authQueries } from "~/domains/auth";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [{ title: "로그인" }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const meQuery = authQueries.getMe();
  const me = await queryClient.ensureQueryData(meQuery);
  if (me) {
    throw redirect("/home");
  }

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo");
  const oauthError = url.searchParams.get("error");
  const oauthErrorDescription = url.searchParams.get("error_description");

  return { redirectTo, oauthError, oauthErrorDescription };
}

export default function LoginRoute() {
  return <LoginView />;
}

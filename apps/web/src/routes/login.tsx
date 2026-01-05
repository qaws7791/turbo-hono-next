import { redirect } from "react-router";

import type { Route } from "./+types/login";

import {
  LoginView,
  authQueries,
  useLoginViewModel,
  useMagicLinkMutation,
} from "~/domains/auth";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [{ title: "로그인" }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const meQuery = authQueries.getMe();
  await queryClient.prefetchQuery(meQuery);
  const me = queryClient.getQueryData(meQuery.queryKey);
  if (me) {
    throw redirect("/home");
  }

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo");
  return { redirectTo };
}

export default function LoginRoute() {
  const mutation = useMagicLinkMutation();

  const model = useLoginViewModel({
    actionData: mutation.actionData,
    isSubmitting: mutation.isSubmitting,
  });

  return (
    <LoginView
      state={model.state}
      onChangeEmail={model.resetToIdle}
      onSendMagicLink={mutation.sendMagicLink}
    />
  );
}

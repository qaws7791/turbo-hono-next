import { redirect } from "react-router";

import { logoutAndClearCache } from "~/modules/auth";

export async function clientAction() {
  await logoutAndClearCache();
  throw redirect("/");
}

export async function clientLoader() {
  await logoutAndClearCache();
  throw redirect("/");
}

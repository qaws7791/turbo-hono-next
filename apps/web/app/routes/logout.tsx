import { redirect } from "react-router";

import { postLogout } from "~/modules/auth";

export async function clientAction() {
  await postLogout();
  throw redirect("/");
}

export async function clientLoader() {
  await postLogout();
  throw redirect("/");
}

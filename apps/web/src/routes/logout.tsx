import { redirect } from "react-router";

import { logout } from "~/foundation/api/auth";

export async function clientAction() {
  await logout();
  throw redirect("/");
}

export function clientLoader() {
  throw redirect("/");
}

import { redirect } from "react-router";

import { logout } from "~/mock/api";

export async function clientAction() {
  logout();
  throw redirect("/");
}

export function clientLoader() {
  throw redirect("/");
}

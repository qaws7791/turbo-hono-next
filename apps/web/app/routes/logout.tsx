import { redirect } from "react-router";

import type { Route } from "./+types/logout";

import { logout } from "~/mock/api";

export async function clientAction(_: Route.ClientActionArgs) {
  logout();
  throw redirect("/");
}

export function clientLoader() {
  throw redirect("/");
}

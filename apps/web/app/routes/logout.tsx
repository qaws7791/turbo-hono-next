import { redirect } from "react-router";

import { apiClient, unwrap } from "~/modules/api";

export async function clientAction() {
  const result = await apiClient.POST("/api/auth/logout");
  unwrap(result);
  throw redirect("/");
}

export async function clientLoader() {
  const result = await apiClient.POST("/api/auth/logout");
  unwrap(result);
  throw redirect("/");
}

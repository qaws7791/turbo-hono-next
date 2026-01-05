import * as React from "react";
import { redirect, useNavigate } from "react-router";

import { logout } from "~/domains/auth";

export function clientLoader() {
  throw redirect("/");
}

export default function LogoutRoute() {
  const navigate = useNavigate();

  React.useEffect(() => {
    logout().finally(() => navigate("/"));
  }, [navigate]);

  return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-muted-foreground">로그아웃 중...</p>
    </div>
  );
}

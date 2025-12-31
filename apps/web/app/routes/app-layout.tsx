import * as React from "react";
import { useLocation, useNavigate } from "react-router";

import { isUnauthorizedError } from "~/modules/api";
import { AppShell } from "~/modules/app-shell";
import { useAuthMeQuery } from "~/modules/auth";
import { useSpacesQuery } from "~/modules/spaces";

export default function AppLayoutRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const me = useAuthMeQuery();
  const spaces = useSpacesQuery();

  React.useEffect(() => {
    if (!me.isError) return;
    if (!isUnauthorizedError(me.error)) return;

    const redirectTo = `${location.pathname}${location.search}`;
    navigate(`/login?redirectTo=${encodeURIComponent(redirectTo)}`, {
      replace: true,
    });
  }, [location.pathname, location.search, me.error, me.isError, navigate]);

  if (me.isLoading) {
    return null;
  }

  if (me.isError) {
    return null;
  }

  if (!me.data) {
    return null;
  }

  return (
    <AppShell
      user={me.data}
      spaces={spaces.data ?? []}
    />
  );
}

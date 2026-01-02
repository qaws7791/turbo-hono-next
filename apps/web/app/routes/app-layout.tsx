import { AppShell } from "~/modules/app-shell";
import {
  useAuthMeQuery,
  useRedirectToLoginOnUnauthorized,
} from "~/modules/auth";
import { useSpacesQuery } from "~/modules/spaces";

export default function AppLayoutRoute() {
  const me = useAuthMeQuery();
  const spaces = useSpacesQuery();

  useRedirectToLoginOnUnauthorized({ isError: me.isError, error: me.error });

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

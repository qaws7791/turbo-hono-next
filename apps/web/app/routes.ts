import { index, layout, route } from "@react-router/dev/routes";

import type { RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("session", "routes/session.tsx"),
  layout("routes/app-layout.tsx", [
    route("home", "routes/home.tsx"),
    route("spaces", "routes/spaces.tsx"),
    route("concepts", "routes/concepts.tsx"),
    route("concept/:conceptId", "routes/concept-detail.tsx"),
    route("concepts/:conceptId", "routes/concept-detail-alias.tsx"),
    route("spaces/:spaceId", "routes/space-layout.tsx", [
      index("routes/space-plans.tsx"),
      route("documents", "routes/space-documents.tsx"),
      route("plans/new", "routes/plan-wizard.tsx"),
      route("plan/:planId", "routes/plan-detail.tsx"),
      route("concepts", "routes/space-concepts.tsx"),
    ]),
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;

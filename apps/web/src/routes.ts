import { index, layout, route } from "@react-router/dev/routes";

import type { RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("session", "routes/session.tsx"),
  layout("routes/app-layout.tsx", [
    route("home", "routes/home.tsx"),
    route("today", "routes/today.tsx"),
    route("plans", "routes/plans.tsx"),
    route("plans/new", "routes/plan-wizard.tsx"),
    route("plans/:planId", "routes/plan-detail.tsx"),
    route("materials", "routes/materials.tsx"),
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;

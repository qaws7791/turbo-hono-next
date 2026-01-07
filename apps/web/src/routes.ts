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
    route("spaces", "routes/spaces.tsx"),
    route("concepts", "routes/concepts.tsx"),
    route("concept/:conceptId", "routes/concept-detail.tsx"),
    route("spaces/:spaceId", "routes/space-layout.tsx", [
      route("plans/new", "routes/plan-wizard.tsx"),
    ]),
    // 학습 계획 상세는 스페이스 레이아웃과 분리하여 독립적인 UI 제공
    route("spaces/:spaceId/plan/:planId", "routes/plan-detail.tsx"),
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;

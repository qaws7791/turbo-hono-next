import { Icon } from "@repo/ui/icon";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";

import { AppPageLayout } from "@/shared/components/app-page-layout";
import { Link } from "@/shared/components/link";
import { CompletionCalendarSection } from "@/features/progress/components/completion-calendar-section";
import LearningPlanList from "@/features/learning-plan/components/learning-plan-list";

export const Route = createFileRoute("/app/")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppPageLayout>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">학습 계획</h1>
          <p className="text-muted-foreground mt-1">
            나의 학습 학습 계획을 관리하고 진행상황을 확인해보세요
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 학습 계획 생성 버튼 */}
          <Link
            variant="primary"
            to="/app/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
          >
            <Icon
              type="iconify"
              name="solar--add-square-outline"
            />
            새 학습 계획
          </Link>
        </div>
      </div>

      <div className="flex flex-row gap-4">
        <Suspense fallback={null}>
          <LearningPlanList />
          <CompletionCalendarSection />
        </Suspense>
      </div>
    </AppPageLayout>
  );
}

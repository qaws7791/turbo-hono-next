import { Icon } from "@repo/ui/icon";
import { createFileRoute } from "@tanstack/react-router";

import { Chat } from "@/features/ai-chat/components/chat";
import { LearningModuleList } from "@/features/learning-plan/components/learning-module-list";
import LearningPlanInfo from "@/features/learning-plan/components/learning-plan-info";
import { useLearningPlanDetail } from "@/features/learning-plan/hooks/use-learning-plan-detail";
import { AppPageLayout } from "@/shared/components/app-page-layout";
import { Link } from "@/shared/components/link";

export const Route = createFileRoute("/app/learning-plans/$learningPlanId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { learningPlanId } = Route.useParams();
  const { isLoading, isError, error, learningPlan, learningModules } =
    useLearningPlanDetail(learningPlanId);

  if (isLoading) {
    return (
      <AppPageLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-2">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground">
              학습 계획을 불러오는 중...
            </p>
          </div>
        </div>
      </AppPageLayout>
    );
  }

  if (isError || !learningPlan) {
    return (
      <AppPageLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              학습 계획을 찾을 수 없습니다
            </h2>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "존재하지 않는 학습 계획이거나 접근 권한이 없습니다."}
            </p>
            <Link
              to="/app"
              variant="outline"
            >
              <Icon
                name="solar--arrow-left-outline"
                type="iconify"
                className="size-4 mr-2"
              />
              학습 계획 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </AppPageLayout>
    );
  }

  const learningPlanEmoji = learningPlan.emoji || "📚";
  const emojiLabel = learningPlan.title
    ? `${learningPlan.title} 학습 계획 아이콘`
    : "학습 계획 아이콘";

  return (
    <AppPageLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex flex-col items-start justify-between gap-4">
          <Link
            to="/app"
            variant="ghost"
          >
            <Icon
              name="solar--arrow-left-outline"
              type="iconify"
              className="size-4 mr-2"
            />
            뒤로가기
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span
                className="text-3xl leading-none"
                role="img"
                aria-label={emojiLabel}
              >
                {learningPlanEmoji}
              </span>
              <h1 className="text-2xl font-bold text-foreground">
                {learningPlan.title}
              </h1>
            </div>
            {learningPlan.description && (
              <p className="text-muted-foreground">
                {learningPlan.description}
              </p>
            )}
          </div>
        </div>

        {/* 학습 계획 정보 */}
        <LearningPlanInfo
          id={learningPlan.id}
          title={learningPlan.title}
          description={learningPlan.description || undefined}
          status={learningPlan.status}
          createdAt={learningPlan.createdAt}
          updatedAt={learningPlan.updatedAt}
          documents={learningPlan.documents}
        />

        {/* 메인 콘텐츠 - 좌우 분할 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 좌측 패널 - 학습 계획 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 목표 목록 */}
            <LearningModuleList
              learningModules={learningModules}
              learningPlanId={learningPlanId}
            />
          </div>

          <Chat learningPlanId={learningPlanId} />
        </div>
      </div>
    </AppPageLayout>
  );
}

import { Icon } from "@repo/ui/icon";
import { createFileRoute } from "@tanstack/react-router";

import { AppPageLayout } from "@/shared/components/app-page-layout";
import { Link } from "@/shared/components/link";
import { GoalList } from "@/features/roadmap/components/goal-list";
import RoadmapInfo from "@/features/roadmap/components/roadmap-info";
import { useRoadmapDetail } from "@/features/roadmap/hooks/use-roadmap-detail";

export const Route = createFileRoute("/app/roadmaps/$roadmapId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { roadmapId } = Route.useParams();
  const { isLoading, isError, error, roadmap, goals } =
    useRoadmapDetail(roadmapId);

  if (isLoading) {
    return (
      <AppPageLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-2">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground">
              로드맵을 불러오는 중...
            </p>
          </div>
        </div>
      </AppPageLayout>
    );
  }

  if (isError || !roadmap) {
    return (
      <AppPageLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              로드맵을 찾을 수 없습니다
            </h2>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "존재하지 않는 로드맵이거나 접근 권한이 없습니다."}
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
              로드맵 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </AppPageLayout>
    );
  }

  const roadmapEmoji = roadmap.emoji || "📚";
  const emojiLabel = roadmap.title
    ? `${roadmap.title} 로드맵 아이콘`
    : "로드맵 아이콘";

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
                {roadmapEmoji}
              </span>
              <h1 className="text-2xl font-bold text-foreground">
                {roadmap.title}
              </h1>
            </div>
            {roadmap.description && (
              <p className="text-muted-foreground">{roadmap.description}</p>
            )}
          </div>
        </div>

        {/* 로드맵 정보 */}
        <RoadmapInfo
          id={roadmap.id}
          status={roadmap.status}
          createdAt={roadmap.createdAt || ""}
          updatedAt={roadmap.updatedAt || ""}
          documents={roadmap.documents}
        />

        {/* 메인 콘텐츠 - 좌우 분할 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 좌측 패널 - 로드맵 콘텐츠 */}
          <div className="col-span-3 space-y-6">
            {/* 목표 목록 */}
            <GoalList
              goals={goals}
              roadmapId={roadmapId}
            />
          </div>

          {/* 우측 패널 - AI 채팅과 메타데이터 (X: 추후 API 구현 후 추가)*/}
        </div>
      </div>
    </AppPageLayout>
  );
}

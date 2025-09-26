import type { paths } from "@/api/schema";
import AppPageLayout from "@/components/app-page-layout";
import { Link } from "@/components/link";
import { roadmapQueryOptions } from "@/domains/roadmap/queries/roadmap-query-options";
import { GoalList } from "@/domains/roadmap/components/goal-list";
import RoadmapInfo from "@/domains/roadmap/components/roadmap-info";
import type { Goal } from "@/domains/roadmap/types";
import { Icon } from "@repo/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/roadmaps/$roadmapId")({
  component: RouteComponent,
});

// Transform API data to match component expectations
function transformGoals(
  apiGoals: paths["/roadmaps/{roadmapId}"]["get"]["responses"][200]["content"]["application/json"]["goals"][number][],
): Goal[] {
  return apiGoals.map((goal) => {
    const completedSubGoals =
      goal.subGoals?.filter((subGoal: any) => subGoal.isCompleted).length || 0;
    const hasSubGoals = goal.subGoals?.length > 0;
    const isCompleted = hasSubGoals
      ? completedSubGoals === goal.subGoals.length
      : false;

    return {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      order: goal.order,
      isExpanded: goal.isExpanded,
      subGoals: goal.subGoals || [],
      hasSubGoals,
      completedSubGoals,
      isCompleted,
    };
  });
}

function RouteComponent() {
  const { roadmapId } = Route.useParams();
  const roadmap = useQuery(roadmapQueryOptions(roadmapId));

  if (roadmap.isLoading) {
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

  if (roadmap.isError || !roadmap.data) {
    return (
      <AppPageLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              로드맵을 찾을 수 없습니다
            </h2>
            <p className="text-sm text-muted-foreground">
              {roadmap.error?.message ||
                "존재하지 않는 로드맵이거나 접근 권한이 없습니다."}
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

  const transformedGoals = transformGoals(roadmap.data.data?.goals || []);

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
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {roadmap.data.data?.title}
            </h1>
            {roadmap.data.data?.description && (
              <p className="text-muted-foreground mt-1">
                {roadmap.data.data?.description}
              </p>
            )}
          </div>
        </div>

        {/* 로드맵 정보 */}
        <RoadmapInfo
          id={roadmap.data.data?.id}
          status={roadmap.data.data?.status}
          createdAt={roadmap.data.data?.createdAt || ""}
          updatedAt={roadmap.data.data?.updatedAt || ""}
        />

        {/* 메인 콘텐츠 - 좌우 분할 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 좌측 패널 - 로드맵 콘텐츠 */}
          <div className="col-span-3 space-y-6">
            {/* 목표 목록 */}
            <GoalList
              goals={transformedGoals}
              roadmapId={roadmapId}
            />
          </div>

          {/* 우측 패널 - AI 채팅과 메타데이터 (X: 추후 API 구현 후 추가)*/}
        </div>
      </div>
    </AppPageLayout>
  );
}

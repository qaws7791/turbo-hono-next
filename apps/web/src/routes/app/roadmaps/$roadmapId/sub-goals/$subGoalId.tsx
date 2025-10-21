import { Badge } from "@repo/ui/badge";
import { Icon } from "@repo/ui/icon";
import { Tab, TabList, TabPanel, Tabs } from "@repo/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { parseAsStringLiteral, useQueryState } from "nuqs";

import { AiNoteTab } from "./components/ai-note-tab";
import { AiQuizTab } from "./components/ai-quiz-tab";
import { OverviewTab } from "./components/overview-tab";

import type { SubGoalNoteStatus } from "@/domains/roadmap/types";

import { subGoalDetailQueryOptions } from "@/domains/roadmap/queries/sub-goal-detail-query-options";
import { Link } from "@/components/link";
import AppPageLayout from "@/components/app-page-layout";

export const Route = createFileRoute(
  "/app/roadmaps/$roadmapId/sub-goals/$subGoalId",
)({
  component: RouteComponent,
});

const NOTE_REFETCH_INTERVAL_MS = 4000;
const SUB_GOAL_TAB_VALUES = ["overview", "ai-note", "ai-quiz"] as const;
type SubGoalTab = (typeof SUB_GOAL_TAB_VALUES)[number];
const subGoalTabParser =
  parseAsStringLiteral(SUB_GOAL_TAB_VALUES).withDefault("overview");

function RouteComponent() {
  const { roadmapId, subGoalId } = Route.useParams();
  const subGoal = useQuery({
    ...subGoalDetailQueryOptions(roadmapId, subGoalId),
    refetchInterval: (query) => {
      const noteStatus =
        query.state.data?.data?.aiNoteStatus ?? ("idle" as SubGoalNoteStatus);
      return noteStatus === "processing" ? NOTE_REFETCH_INTERVAL_MS : false;
    },
  });

  const [selectedTab, setSelectedTab] = useQueryState<SubGoalTab>(
    "tab",
    subGoalTabParser,
  );

  if (subGoal.isLoading) {
    return (
      <AppPageLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-2">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              세부 목표를 불러오는 중입니다...
            </p>
          </div>
        </div>
      </AppPageLayout>
    );
  }

  if (subGoal.isError || !subGoal.data?.data) {
    return (
      <AppPageLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="space-y-4 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              세부 목표를 찾을 수 없습니다
            </h2>
            <p className="text-sm text-muted-foreground">
              {subGoal.error?.message ||
                "존재하지 않는 세부 목표이거나 접근 권한이 없습니다."}
            </p>
            <Link
              to="/app/roadmaps/$roadmapId"
              params={{ roadmapId }}
              variant="outline"
            >
              <Icon
                name="solar--arrow-left-outline"
                type="iconify"
                className="mr-2 size-4"
              />
              로드맵 상세로 돌아가기
            </Link>
          </div>
        </div>
      </AppPageLayout>
    );
  }

  const detail = subGoal.data.data;
  return (
    <AppPageLayout>
      <div className="space-y-6">
        <Link
          to="/app/roadmaps/$roadmapId"
          params={{ roadmapId }}
          variant="ghost"
        >
          <Icon
            name="solar--arrow-left-outline"
            type="iconify"
            className="mr-2 size-4"
          />
          로드맵 상세로 돌아가기
        </Link>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icon
                name="solar--bookmark-square-outline"
                type="iconify"
                className="size-3.5"
              />
              <span>{detail.roadmap.title}</span>
            </div>
            <Icon
              name="solar--alt-arrow-right-outline"
              type="iconify"
              className="size-3 text-muted-foreground/70"
            />
            <div className="flex items-center gap-1">
              <Icon
                name="solar--target-outline"
                type="iconify"
                className="size-3.5"
              />
              <span>{detail.goal.title}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {detail.title}
            </h1>
            <Badge variant={detail.isCompleted ? "primary" : "outline"}>
              {detail.isCompleted ? "완료됨" : "진행중"}
            </Badge>
          </div>

          {detail.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {detail.description}
            </p>
          )}
        </div>

        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => {
            const nextTab = String(key) as SubGoalTab;
            if (nextTab === selectedTab) {
              return;
            }

            void setSelectedTab(nextTab);
          }}
          className="gap-4"
        >
          <TabList aria-label="세부 목표 상세 탭">
            <Tab id="overview">개요</Tab>
            <Tab id="ai-note">AI 노트</Tab>
            <Tab id="ai-quiz">학습 퀴즈</Tab>
          </TabList>

          <TabPanel
            id="overview"
            className="space-y-4"
          >
            <OverviewTab detail={detail} />
          </TabPanel>

          <TabPanel
            id="ai-note"
            className="space-y-4"
          >
            <AiNoteTab
              detail={detail}
              roadmapId={roadmapId}
              subGoalId={subGoalId}
            />
          </TabPanel>

          <TabPanel
            id="ai-quiz"
            className="space-y-4"
          >
            <AiQuizTab
              detail={detail}
              roadmapId={roadmapId}
              subGoalId={subGoalId}
            />
          </TabPanel>
        </Tabs>
      </div>
    </AppPageLayout>
  );
}

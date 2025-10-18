import { api } from "@/api/http-client";
import AppPageLayout from "@/components/app-page-layout";
import { Link } from "@/components/link";
import { subGoalDetailQueryOptions } from "@/domains/roadmap/queries/sub-goal-detail-query-options";
import type { SubGoalNoteStatus } from "@/domains/roadmap/types";
import { formatSubGoalDueDate } from "@/domains/roadmap/utils/format-sub-goal-due-date";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Icon } from "@repo/ui/icon";
import { Tab, TabList, TabPanel, Tabs } from "@repo/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import LinkExtension from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { all, createLowlight } from 'lowlight';
import { marked } from "marked";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/app/roadmaps/$roadmapId/sub-goals/$subGoalId",
)({
  component: RouteComponent,
});

const lowlight = createLowlight(all);

marked.use({
  gfm: true,
  breaks: true,
});

const NOTE_REFETCH_INTERVAL_MS = 4000;

const AI_NOTE_STATUS_META: Record<
  SubGoalNoteStatus,
  {
    label: string;
    badgeVariant: "outline" | "primary" | "secondary" | "destructive";
  }
> = {
  idle: { label: "미생성", badgeVariant: "outline" },
  processing: { label: "생성 중", badgeVariant: "secondary" },
  ready: { label: "생성 완료", badgeVariant: "primary" },
  failed: { label: "생성 실패", badgeVariant: "destructive" },
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNullableDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return formatDateTime(value);
}

function RouteComponent() {
  const { roadmapId, subGoalId } = Route.useParams();
  const queryClient = useQueryClient();
  const subGoal = useQuery({
    ...subGoalDetailQueryOptions(roadmapId, subGoalId),
    refetchInterval: (query) => {
      const noteStatus =
        query.state.data?.data?.aiNoteStatus ?? ("idle" as SubGoalNoteStatus);
      return noteStatus === "processing" ? NOTE_REFETCH_INTERVAL_MS : false;
    },
  });
  const generateNoteMutation = useMutation({
    mutationFn: (options?: { force?: boolean }) =>
      api.ai.generateSubGoalNote(
        roadmapId,
        subGoalId,
        options?.force ? { force: options.force } : undefined,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["subgoal", roadmapId, subGoalId],
      });
    },
  });

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
  const dueDateLabel = formatSubGoalDueDate(detail.dueDate);
  const noteStatus = detail.aiNoteStatus;
  const noteStatusMeta = AI_NOTE_STATUS_META[noteStatus];
  const isNoteProcessing =
    noteStatus === "processing" || generateNoteMutation.isPending;
  const mutationErrorMessage =
    generateNoteMutation.error instanceof Error
      ? generateNoteMutation.error.message
      : null;
  const requestedAtLabel = formatNullableDateTime(detail.aiNoteRequestedAt);
  const completedAtLabel = formatNullableDateTime(detail.aiNoteCompletedAt);
  const hasNoteContent =
    noteStatus === "ready" && typeof detail.aiNoteMarkdown === "string";

  const handleGenerateNote = async (force?: boolean) => {
    if (isNoteProcessing) {
      return;
    }

    await generateNoteMutation.mutateAsync(force ? { force } : undefined);
  };

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
          defaultSelectedKey="overview"
          className="gap-4"
        >
          <TabList aria-label="세부 목표 상세 탭">
            <Tab id="overview">개요</Tab>
            <Tab id="ai-note">AI 노트</Tab>
          </TabList>

          <TabPanel id="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="space-y-4 p-4">
                <div className="flex items-center gap-2">
                  <Icon
                    name="solar--calendar-outline"
                    type="iconify"
                    className="size-4 text-primary"
                  />
                  <h2 className="text-sm font-semibold text-foreground">
                    마감 정보
                  </h2>
                </div>

                {detail.dueDate ? (
                  <div>
                    <div
                      className={`text-lg font-semibold ${
                        dueDateLabel.isOverdue
                          ? "text-destructive"
                          : dueDateLabel.isToday
                            ? "text-orange-600"
                            : dueDateLabel.isUrgent
                              ? "text-yellow-600"
                              : "text-foreground"
                      }`}
                    >
                      {dueDateLabel.text}
                    </div>
                    {dueDateLabel.formattedDate &&
                      dueDateLabel.text !== dueDateLabel.formattedDate && (
                        <div className="text-sm text-muted-foreground">
                          {dueDateLabel.formattedDate}
                        </div>
                      )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    마감일이 설정되지 않았습니다.
                  </p>
                )}

                <div className="flex items-center gap-2 rounded-md border border-muted bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  <Icon
                    name={
                      detail.isCompleted
                        ? "solar--check-circle-outline"
                        : "solar--clock-circle-outline"
                    }
                    type="iconify"
                    className="size-4"
                  />
                  <span>
                    현재 상태:{" "}
                    <span className="font-medium text-foreground">
                      {detail.isCompleted ? "완료됨" : "진행중"}
                    </span>
                  </span>
                </div>
              </Card>

              <Card className="space-y-4 p-4">
                <div className="flex items-center gap-2">
                  <Icon
                    name="solar--target-outline"
                    type="iconify"
                    className="size-4 text-primary"
                  />
                  <h2 className="text-sm font-semibold text-foreground">
                    상위 목표 정보
                  </h2>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">로드맵</span>
                    <p className="font-medium text-foreground">
                      {detail.roadmap.title}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">목표</span>
                    <p className="font-medium text-foreground">
                      {detail.goal.title}
                    </p>
                    {detail.goal.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {detail.goal.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1 rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <div>목표 순서: {detail.goal.order}</div>
                  <div>세부 목표 순서: {detail.order}</div>
                </div>
              </Card>
            </div>

            <Card className="space-y-4 p-4 md:w-1/2">
              <div className="flex items-center gap-2">
                <Icon
                  name="solar--history-outline"
                  type="iconify"
                  className="size-4 text-primary"
                />
                <h2 className="text-sm font-semibold text-foreground">기록</h2>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">생성일</span>
                  <span className="font-medium text-foreground">
                    {formatDateTime(detail.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">마지막 업데이트</span>
                  <span className="font-medium text-foreground">
                    {formatDateTime(detail.updatedAt)}
                  </span>
                </div>
              </div>
            </Card>

            {detail.memo && (
              <Card className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Icon
                    name="solar--file-text-outline"
                    type="iconify"
                    className="size-4 text-primary"
                  />
                  <h2 className="text-sm font-semibold text-foreground">
                    메모
                  </h2>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {detail.memo}
                </p>
              </Card>
            )}
          </TabPanel>

          <TabPanel id="ai-note" className="space-y-4">
            <Card className="space-y-4 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon
                    name="solar--pen-2-outline"
                    type="iconify"
                    className="size-4 text-primary"
                  />
                  <h2 className="text-sm font-semibold text-foreground">
                    AI 학습 노트
                  </h2>
                </div>
                <Badge variant={noteStatusMeta.badgeVariant}>
                  {noteStatusMeta.label}
                </Badge>
              </div>

              {noteStatus === "processing" && (
                <div className="flex items-center gap-3 rounded-md border border-muted bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>
                    AI가 노트를 생성하는 중입니다. 다른 페이지를 방문해도
                    완료되면 자동으로 표시돼요.
                  </span>
                </div>
              )}

              {noteStatus === "failed" && detail.aiNoteError && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {detail.aiNoteError}
                </div>
              )}

              {mutationErrorMessage && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {mutationErrorMessage}
                </div>
              )}

              {hasNoteContent && detail.aiNoteMarkdown ? (
                <AINoteViewer markdown={detail.aiNoteMarkdown} />
              ) : noteStatus !== "processing" ? (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    AI가 세부 목표의 맥락과 학습 시간을 고려해 요약, 실습 계획,
                    체크리스트가 포함된 노트를 생성합니다.
                  </p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>로드맵, 목표, 참고 문서 정보를 함께 반영합니다.</li>
                    <li>
                      생성된 노트는 언제든지 다시 생성해 최신 내용을 받을 수
                      있습니다.
                    </li>
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <span>
                  최근 요청:{" "}
                  <span className="font-medium text-foreground">
                    {requestedAtLabel}
                  </span>
                </span>
                <span>
                  최근 완료:{" "}
                  <span className="font-medium text-foreground">
                    {completedAtLabel}
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    handleGenerateNote(
                      noteStatus === "ready" || noteStatus === "failed"
                        ? true
                        : undefined,
                    )
                  }
                  size="sm"
                  variant={noteStatus === "ready" ? "outline" : "primary"}
                  isDisabled={isNoteProcessing}
                >
                  {isNoteProcessing && (
                    <span className="mr-2 inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {noteStatus === "ready"
                    ? "노트 다시 생성"
                    : noteStatus === "failed"
                      ? "다시 시도"
                      : "AI 노트 생성"}
                </Button>
                {noteStatus === "ready" && (
                  <Button
                    onClick={() => handleGenerateNote(true)}
                    isDisabled={isNoteProcessing}
                    size="sm"
                    variant="ghost"
                  >
                    다른 버전 생성
                  </Button>
                )}
              </div>
            </Card>
          </TabPanel>
        </Tabs>
      </div>
    </AppPageLayout>
  );
}

function AINoteViewer({ markdown }: { markdown: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      LinkExtension.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    editable: false,
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose max-w-none prose-headings:font-semibold prose-ul:list-disc prose-ol:list-decimal prose-pre:bg-muted prose-pre:rounded-md prose-pre:p-4 whitespace-pre-wrap break-all",
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const html = (marked.parse(markdown ?? "") as string) || "<p></p>";

    if (editor.getHTML() === html) {
      return;
    }

    editor.commands.setContent(html);
  }, [editor, markdown]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
}

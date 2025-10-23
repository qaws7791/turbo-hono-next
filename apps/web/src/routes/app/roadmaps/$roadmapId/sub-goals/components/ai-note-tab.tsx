import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Icon } from "@repo/ui/icon";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import LinkExtension from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { all, createLowlight } from "lowlight";
import { marked } from "marked";
import { useEffect } from "react";

import type { SubGoalDetail } from "@/domains/roadmap/model/types";

import { AI_NOTE_STATUS_META } from "@/domains/roadmap/model/status-meta";
import { formatNullableDateTime } from "@/domains/roadmap/model/date";
import { api } from "@/api/http-client";

type AiNoteTabProps = {
  detail: SubGoalDetail;
  roadmapId: string;
  subGoalId: string;
};

const lowlight = createLowlight(all);

marked.use({
  gfm: true,
  breaks: true,
});

export function AiNoteTab({ detail, roadmapId, subGoalId }: AiNoteTabProps) {
  const queryClient = useQueryClient();
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
            AI가 노트를 생성하는 중입니다. 다른 페이지를 방문해도 완료되면
            자동으로 표시돼요.
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
        <AiNoteViewer markdown={detail.aiNoteMarkdown} />
      ) : noteStatus !== "processing" ? (
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            AI가 세부 목표의 맥락과 학습 시간을 고려해 요약, 실습 계획,
            체크리스트가 포함된 노트를 생성합니다.
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>로드맵, 목표, 참고 문서 정보를 함께 반영합니다.</li>
            <li>
              생성된 노트는 언제든지 다시 생성해 최신 내용을 받을 수 있습니다.
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
  );
}

function AiNoteViewer({ markdown }: { markdown: string }) {
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

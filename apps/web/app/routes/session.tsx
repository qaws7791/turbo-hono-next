import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Spinner } from "@repo/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import type { CreateRunActivityBody } from "~/modules/session-runs";

import { safeRedirectTo } from "~/lib/auth";
import {
  useAuthMeQuery,
  useRedirectToLoginOnUnauthorized,
} from "~/modules/auth";
import {
  SessionCompletedView,
  SessionView,
  buildSessionUrl,
  sessionRunKeys,
  useAbandonSessionRunMutation,
  useCompleteSessionRunMutation,
  useCreateSessionRunActivityMutation,
  useCreateSessionRunCheckinMutation,
  useSaveSessionRunProgressMutation,
  useSessionRunDetailQuery,
  useStartSessionRunMutation,
} from "~/modules/session-runs";

export function meta() {
  return [{ title: "학습 세션" }];
}

export default function SessionRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const runId = String(searchParams.get("runId") ?? "");
  const sessionId = String(searchParams.get("sessionId") ?? "");
  const redirectTo = safeRedirectTo(searchParams.get("redirectTo")) || "/today";

  const me = useAuthMeQuery();
  const startRun = useStartSessionRunMutation();
  const runDetail = useSessionRunDetailQuery(runId);
  const saveProgress = useSaveSessionRunProgressMutation();
  const createActivity = useCreateSessionRunActivityMutation();
  const createCheckin = useCreateSessionRunCheckinMutation();
  const completeRun = useCompleteSessionRunMutation();
  const abandonRun = useAbandonSessionRunMutation();

  useRedirectToLoginOnUnauthorized({ isError: me.isError, error: me.error });

  // Start run when sessionId is provided
  const startedRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!me.data) return;
    if (!sessionId) return;
    if (runId) return;
    if (startRun.isPending) return;
    if (startedRef.current === sessionId) return;

    startedRef.current = sessionId;
    startRun.mutate(
      { sessionId },
      {
        onSuccess: (data) => {
          navigate(buildSessionUrl({ runId: data.data.runId, redirectTo }), {
            replace: true,
          });
        },
      },
    );
  }, [me.data, navigate, redirectTo, runId, sessionId, startRun]);

  const isMutating =
    startRun.isPending ||
    saveProgress.isPending ||
    createActivity.isPending ||
    createCheckin.isPending ||
    completeRun.isPending ||
    abandonRun.isPending;

  // Local state
  const [localStepIndex, setLocalStepIndex] = React.useState(0);
  const [localInputs, setLocalInputs] = React.useState<Record<string, unknown>>(
    {},
  );
  const [closeDialogOpen, setCloseDialogOpen] = React.useState(false);

  // Initialize from run detail
  const initializedRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!runId) return;
    if (!runDetail.data) return;
    if (initializedRef.current === runId) return;
    initializedRef.current = runId;

    setLocalStepIndex(runDetail.data.data.progress.stepIndex);
    setLocalInputs(runDetail.data.data.progress.inputs ?? {});
  }, [runDetail.data, runId]);

  const persistProgress = React.useCallback(
    (nextStepIndex: number, nextInputs: Record<string, unknown>) => {
      if (!runId) return;
      saveProgress.mutate({
        runId,
        body: { stepIndex: nextStepIndex, inputs: nextInputs },
      });
    },
    [runId, saveProgress],
  );

  const updateInputs = React.useCallback(
    (patch: Record<string, unknown>) => {
      setLocalInputs((prev) => {
        const next = { ...prev, ...patch };
        persistProgress(localStepIndex, next);
        return next;
      });
    },
    [localStepIndex, persistProgress],
  );

  const recordActivity = React.useCallback(
    (body: CreateRunActivityBody) => {
      if (!runId) return;
      createActivity.mutate({ runId, body });
    },
    [createActivity, runId],
  );

  const detail = runDetail.data?.data;
  const steps = detail?.blueprint.steps ?? [];
  const maxIndex = Math.max(0, steps.length - 1);

  const handlePrev = React.useCallback(() => {
    const next = Math.max(0, localStepIndex - 1);
    setLocalStepIndex(next);
    persistProgress(next, localInputs);
  }, [localStepIndex, localInputs, persistProgress]);

  const handleNext = React.useCallback(() => {
    const next = Math.min(maxIndex, localStepIndex + 1);
    setLocalStepIndex(next);
    persistProgress(next, localInputs);
  }, [localStepIndex, localInputs, maxIndex, persistProgress]);

  const handleComplete = React.useCallback(() => {
    if (!runId) return;
    completeRun.mutate(
      { runId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: sessionRunKeys.detail(runId),
          });
        },
      },
    );
  }, [runId, completeRun, queryClient]);

  const handleAbandon = React.useCallback(() => {
    if (!runId) return;
    abandonRun.mutate(
      { runId, body: { reason: "USER_EXIT" } },
      {
        onSuccess: () => {
          navigate(redirectTo);
        },
      },
    );
  }, [runId, abandonRun, navigate, redirectTo]);

  // Loading state: auth
  if (me.isLoading) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-xl items-center px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base">세션 준비 중</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            인증 상태 확인 중
          </CardContent>
        </Card>
      </div>
    );
  }

  // Auth error (redirect handled by hook)
  if (me.isError) {
    return null;
  }

  // Run detail error
  if (runId && runDetail.isError) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-xl items-center px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base">세션을 찾을 수 없습니다</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>해당 `runId`의 세션을 조회할 수 없습니다.</p>
            <Button
              type="button"
              render={<Link to={redirectTo} />}
            >
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Missing params
  if (!runId && !sessionId) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-xl items-center px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base">세션을 찾을 수 없습니다</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>`sessionId` 또는 `runId`가 필요합니다.</p>
            <Button render={<Link to="/today" />}>오늘 할 일로</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state: run detail
  if (runId && !detail) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-xl items-center px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base">세션 불러오는 중</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            세션 정보 조회 중
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completed or abandoned session
  if (detail && detail.status !== "RUNNING") {
    return (
      <SessionCompletedView
        detail={detail}
        redirectTo={redirectTo}
      />
    );
  }

  // Active session
  if (detail) {
    const stepIndex = Math.max(0, Math.min(localStepIndex, maxIndex));

    return (
      <SessionView
        detail={detail}
        stepIndex={stepIndex}
        inputs={localInputs}
        isRecovery={false}
        isMutating={isMutating}
        isSaving={saveProgress.isPending}
        closeDialogOpen={closeDialogOpen}
        onCloseDialogChange={setCloseDialogOpen}
        onUpdateInputs={updateInputs}
        onRecordActivity={recordActivity}
        onPrev={handlePrev}
        onNext={handleNext}
        onComplete={handleComplete}
        onAbandon={handleAbandon}
        redirectTo={redirectTo}
      />
    );
  }

  return null;
}

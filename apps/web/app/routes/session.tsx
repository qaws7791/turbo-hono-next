import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Spinner } from "@repo/ui/spinner";
import * as React from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";

import { useAuthMeQuery } from "~/modules/auth";
import { isUnauthorizedError } from "~/modules/api";
import {
  useAbandonSessionRunMutation,
  useCompleteSessionRunMutation,
  useStartSessionRunMutation,
} from "~/modules/session-runs";

function safeRedirectTo(value: string | null): string {
  if (!value) return "/home";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/home";
}

export function meta() {
  return [{ title: "학습 세션" }];
}

export default function SessionRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const runId = String(searchParams.get("runId") ?? "");
  const sessionId = String(searchParams.get("sessionId") ?? "");
  const redirectTo = safeRedirectTo(searchParams.get("redirectTo"));

  const me = useAuthMeQuery();
  const startRun = useStartSessionRunMutation();
  const completeRun = useCompleteSessionRunMutation();
  const abandonRun = useAbandonSessionRunMutation();

  React.useEffect(() => {
    if (!me.isError) return;
    if (!isUnauthorizedError(me.error)) return;
    const redirectTarget = `${location.pathname}${location.search}`;
    navigate(`/login?redirectTo=${encodeURIComponent(redirectTarget)}`, {
      replace: true,
    });
  }, [location.pathname, location.search, me.error, me.isError, navigate]);

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
          const next = new URLSearchParams();
          next.set("runId", data.data.runId);
          if (redirectTo) next.set("redirectTo", redirectTo);
          navigate(`/session?${next.toString()}`, { replace: true });
        },
      },
    );
  }, [me.data, navigate, redirectTo, runId, sessionId, startRun]);

  const isMutating =
    startRun.isPending || completeRun.isPending || abandonRun.isPending;

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

  if (me.isError) {
    return null;
  }

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

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">학습 세션</CardTitle>
          <div className="text-muted-foreground text-xs">
            runId: <span className="font-mono">{runId || "(생성 중)"}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {startRun.isPending ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              세션을 시작하는 중
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              disabled={!runId || isMutating}
              onClick={() => {
                if (!runId) return;
                completeRun.mutate(
                  { runId },
                  {
                    onSuccess: () => {
                      navigate(redirectTo);
                    },
                  },
                );
              }}
            >
              {completeRun.isPending ? "완료 처리 중" : "완료"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!runId || isMutating}
              onClick={() => {
                if (!runId) return;
                abandonRun.mutate(
                  { runId, body: { reason: "USER_EXIT" } },
                  {
                    onSuccess: () => {
                      navigate(redirectTo);
                    },
                  },
                );
              }}
            >
              중단
            </Button>
          </div>

          <div className="text-muted-foreground text-xs">
            <p>
              현재 API 스펙에는 세션 콘텐츠(스텝/커리큘럼) 조회가 포함되어 있지
              않아, 실행/완료 흐름만 제공합니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


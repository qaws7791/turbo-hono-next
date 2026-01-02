import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Spinner } from "@repo/ui/spinner";
import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { safeRedirectTo } from "~/lib/auth";
import {
  useAuthMeQuery,
  useRedirectToLoginOnUnauthorized,
} from "~/modules/auth";
import { useHomeQueueQuery } from "~/modules/home";

export function meta() {
  return [{ title: "복습" }];
}

export default function ReviewQueueRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const finalRedirectTo = safeRedirectTo(searchParams.get("redirectTo"), {
    fallback: "/today",
  });
  const preferredConceptId = searchParams.get("conceptId");

  const me = useAuthMeQuery();
  const queue = useHomeQueueQuery();

  useRedirectToLoginOnUnauthorized({ isError: me.isError, error: me.error });

  const queueHref = `/review?redirectTo=${encodeURIComponent(finalRedirectTo)}`;

  const startedRef = React.useRef(false);
  React.useEffect(() => {
    if (!me.data) return;
    if (!queue.data) return;
    if (startedRef.current) return;

    const preferred =
      preferredConceptId && preferredConceptId.length > 0
        ? queue.data.data.find(
            (item) =>
              item.kind === "CONCEPT_REVIEW" &&
              item.conceptId === preferredConceptId,
          )
        : undefined;

    const next =
      preferred ??
      queue.data.data.find((item) => item.kind === "CONCEPT_REVIEW");

    if (!next || next.kind !== "CONCEPT_REVIEW") return;

    startedRef.current = true;
    navigate(
      `/review/${next.conceptId}?redirectTo=${encodeURIComponent(queueHref)}`,
      { replace: true },
    );
  }, [me.data, navigate, preferredConceptId, queue.data, queueHref]);

  const isLoading = me.isLoading || queue.isLoading;

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-2xl items-center px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base">복습 준비 중</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            로딩 중
          </CardContent>
        </Card>
      </div>
    );
  }

  if (me.isError) {
    return null;
  }

  if (queue.isError || !queue.data) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-2xl items-center px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base">
              복습을 시작할 수 없습니다
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>오늘 할 일 큐를 불러오지 못했습니다.</div>
            <Button render={<Link to={finalRedirectTo} />}>돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reviewCount = queue.data.data.filter(
    (item) => item.kind === "CONCEPT_REVIEW",
  ).length;

  if (reviewCount === 0) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-2xl items-center px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base">복습할 개념이 없습니다</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>오늘 예정된 복습이 없습니다.</div>
            <Button render={<Link to={finalRedirectTo} />}>돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base">복습 이동 중</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          다음 복습으로 이동합니다…
        </CardContent>
      </Card>
    </div>
  );
}

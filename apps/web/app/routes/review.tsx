import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Spinner } from "@repo/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import Markdown from "react-markdown";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import remarkGfm from "remark-gfm";

import type { ConceptReviewRating } from "~/modules/concepts";

import { safeRedirectTo } from "~/lib/auth";
import {
  useAuthMeQuery,
  useRedirectToLoginOnUnauthorized,
} from "~/modules/auth";
import {
  useConceptQuery,
  useCreateConceptReviewMutation,
} from "~/modules/concepts";
import { homeKeys } from "~/modules/home";

export function meta() {
  return [{ title: "복습" }];
}

const RATING_BUTTONS: Array<{
  rating: ConceptReviewRating;
  label: string;
  variant: "default" | "secondary" | "outline";
}> = [
  { rating: "AGAIN", label: "다시", variant: "outline" },
  { rating: "HARD", label: "어려움", variant: "secondary" },
  { rating: "GOOD", label: "좋음", variant: "default" },
  { rating: "EASY", label: "쉬움", variant: "secondary" },
];

export default function ReviewRoute() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { conceptId } = useParams();
  const [searchParams] = useSearchParams();

  if (!conceptId) {
    throw new Response("Not Found", { status: 404 });
  }

  const redirectTo = safeRedirectTo(
    searchParams.get("redirectTo") ?? `/concept/${conceptId}?tab=note`,
  );

  const me = useAuthMeQuery();
  const concept = useConceptQuery(conceptId);
  const createReview = useCreateConceptReviewMutation();

  useRedirectToLoginOnUnauthorized({ isError: me.isError, error: me.error });

  const isLoading = me.isLoading || concept.isLoading;

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

  if (!concept.data || concept.isError) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-2xl items-center px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base">개념을 찾을 수 없습니다</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <Button
              type="button"
              render={<Link to={redirectTo || "/home"} />}
            >
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">복습</CardTitle>
          <div className="text-muted-foreground text-xs">
            conceptId: <span className="font-mono">{conceptId}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <div className="text-lg font-semibold">{concept.data.title}</div>
            <div className="text-muted-foreground text-sm">
              {concept.data.oneLiner}
            </div>
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <Markdown remarkPlugins={[remarkGfm]}>
              {concept.data.ariNoteMd}
            </Markdown>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">기억이 얼마나 잘 나나요?</div>
            <div className="flex flex-wrap gap-2">
              {RATING_BUTTONS.map((b) => (
                <Button
                  key={b.rating}
                  type="button"
                  variant={b.variant}
                  disabled={createReview.isPending}
                  onClick={() => {
                    createReview.mutate(
                      { conceptId, body: { rating: b.rating } },
                      {
                        onSuccess: () => {
                          queryClient.invalidateQueries({
                            queryKey: homeKeys.queue(),
                          });
                          navigate(redirectTo);
                        },
                      },
                    );
                  }}
                >
                  {createReview.isPending ? "저장 중" : b.label}
                </Button>
              ))}
            </div>
            <div className="text-muted-foreground text-xs">
              선택 결과는 다음 복습 일정(SRS)에 반영됩니다.
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              render={<Link to={redirectTo} />}
              disabled={createReview.isPending}
            >
              나중에
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

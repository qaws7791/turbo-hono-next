import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Progress } from "@repo/ui/progress";
import { Separator } from "@repo/ui/separator";
import { Link } from "react-router";

import type { Space } from "~/mock/schemas";
import type { SpacePlansModel } from "./use-space-plans-model";

import { PlanStatusBadge } from "~/features/plans/plan-status-badge";

export function SpacePlansView({
  space,
  model,
}: {
  space: Space;
  model: SpacePlansModel;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-foreground text-xl font-semibold">학습 계획</h2>
          <p className="text-muted-foreground text-sm">
            문서들을 기반으로 학습 계획을 생성해보세요.
          </p>
        </div>
        <Button render={<Link to={`/spaces/${space.id}/plans/new`} />}>
          + 학습 계획 만들기
        </Button>
      </div>

      {model.plans.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              아직 학습 계획이 없습니다
            </CardTitle>
            <CardDescription>
              문서를 기반으로 AI가 맞춤 학습 계획을 만들어 드립니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link to={`/spaces/${space.id}/plans/new`} />}>
              + 학습 계획 만들기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {model.plans.map((plan) => (
            <Card
              key={plan.id}
              className="flex flex-col"
            >
              <CardHeader className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base truncate">
                    {plan.title}
                  </CardTitle>
                  <PlanStatusBadge status={plan.status} />
                </div>
                <CardDescription>
                  목표 {plan.goal} · 수준 {plan.level} · 문서{" "}
                  {plan.sourceDocumentIds.length}개
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground text-xs">
                      진행률 · {plan.totalSessions}개 세션
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {plan.progressPercent}%
                    </div>
                  </div>
                  <Progress value={plan.progressPercent} />
                </div>

                <Separator />

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    render={<Link to={`/spaces/${space.id}/plan/${plan.id}`} />}
                  >
                    상세
                  </Button>
                  <model.fetcher.Form method="post">
                    <input
                      type="hidden"
                      name="intent"
                      value="set-active"
                    />
                    <input
                      type="hidden"
                      name="planId"
                      value={plan.id}
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full"
                      disabled={model.isSubmitting}
                    >
                      Active로
                    </Button>
                  </model.fetcher.Form>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {plan.status === "active" ? (
                    <model.fetcher.Form method="post">
                      <input
                        type="hidden"
                        name="intent"
                        value="pause"
                      />
                      <input
                        type="hidden"
                        name="planId"
                        value={plan.id}
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        className="w-full"
                        disabled={model.isSubmitting}
                      >
                        Pause
                      </Button>
                    </model.fetcher.Form>
                  ) : plan.status === "paused" ? (
                    <model.fetcher.Form method="post">
                      <input
                        type="hidden"
                        name="intent"
                        value="resume"
                      />
                      <input
                        type="hidden"
                        name="planId"
                        value={plan.id}
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        className="w-full"
                        disabled={model.isSubmitting}
                      >
                        Resume
                      </Button>
                    </model.fetcher.Form>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full"
                      disabled
                    >
                      Archived
                    </Button>
                  )}

                  <model.fetcher.Form
                    method="post"
                    className="sm:col-span-2"
                  >
                    <input
                      type="hidden"
                      name="intent"
                      value="archive"
                    />
                    <input
                      type="hidden"
                      name="planId"
                      value={plan.id}
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      className="w-full"
                      disabled={model.isSubmitting}
                    >
                      Archive
                    </Button>
                  </model.fetcher.Form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

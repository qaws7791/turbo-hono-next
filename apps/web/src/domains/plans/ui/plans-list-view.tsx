import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { IconPlus } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import { plansQueries } from "../plans.queries";

import { PlanGeneratingCard } from "./plan-generating-card";
import { PlanStatusBadge } from "./plan-status-badge";

import { PageBody, PageHeader } from "~/domains/app-shell";
import { getColorByName, getIconByName } from "~/foundation/lib/icon-color";

/**
 * 학습 계획 목록 뷰
 */
export function PlansListView() {
  const { data: plans } = useSuspenseQuery(plansQueries.list());

  return (
    <>
      <PageHeader />
      <PageBody className="space-y-8 mt-24">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">학습 계획</h1>
          <Button render={<Link to="/plans/new" />}>
            <IconPlus className="mr-2 h-4 w-4" />새 계획 만들기
          </Button>
        </div>
        {plans.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              if (plan.generationStatus !== "ready") {
                return (
                  <PlanGeneratingCard
                    key={plan.id}
                    plan={plan}
                  />
                );
              }

              const PlanIcon = getIconByName(plan.icon);
              const colorData = getColorByName(plan.color);

              return (
                <Link
                  key={plan.id}
                  to={`/plans/${plan.id}`}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: colorData?.value + "20" }}
                        >
                          <PlanIcon
                            className="w-6 h-6"
                            style={{ color: colorData?.value }}
                          />
                        </div>
                        <PlanStatusBadge status={plan.status} />
                      </div>
                      <CardTitle className="text-lg mt-2">
                        {plan.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        진행률: {plan.progressPercent}%
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${plan.progressPercent}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </PageBody>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h3 className="text-lg font-semibold mb-2">학습 계획이 없습니다</h3>
      <p className="text-muted-foreground mb-6">
        첫 번째 학습 계획을 만들어보세요.
      </p>
      <Button render={<Link to="/plans/new" />}>
        <IconPlus className="mr-2 h-4 w-4" />새 계획 만들기
      </Button>
    </div>
  );
}

import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { IconPlus } from "@tabler/icons-react";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Link } from "react-router";

import { spacesQueries } from "../spaces.queries";

import { PlanMobileCard } from "./plan-mobile-card";
import { PlanTableRow } from "./plan-table-row";

import { plansQueries } from "~/domains/plans";

export function SpacePlansView({ spaceId }: { spaceId: string }) {
  const [spaceQuery, plansQuery] = useSuspenseQueries({
    queries: [
      spacesQueries.detail(spaceId),
      plansQueries.listForSpace(spaceId),
    ],
  });

  const space = spaceQuery.data;
  const plans = plansQuery.data;

  return (
    <div className="space-y-8">
      {/* 학습 계획 목록 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-foreground text-xl font-semibold">학습 계획</h2>
          <p className="text-muted-foreground text-sm">
            문서들을 기반으로 학습 계획을 생성해보세요.
          </p>
        </div>
        <Button render={<Link to={`/spaces/${space.id}/plans/new`} />}>
          <IconPlus />
          만들기
        </Button>
      </div>

      {plans.length === 0 ? (
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
        <>
          {/* 모바일: 카드 리스트 */}
          <div className="flex flex-col gap-3 md:hidden">
            {plans.map((plan) => (
              <PlanMobileCard
                key={plan.id}
                plan={plan}
                spaceId={space.id}
              />
            ))}
          </div>

          {/* 데스크톱: 테이블 */}
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>계획</TableHead>
                <TableHead>진행률</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <PlanTableRow
                  key={plan.id}
                  plan={plan}
                  spaceId={space.id}
                />
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}

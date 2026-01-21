import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/breadcrumb";
import { Link } from "react-router";

import { PageHeader } from "~/domains/app-shell";

type PlanDetailBreadcrumbProps = {
  planTitle: string;
};

/**
 * 플랜 상세 페이지 Breadcrumb 네비게이션
 *
 * - 학습 계획 > 플랜 제목 경로 표시
 */
export function PlanDetailBreadcrumb({ planTitle }: PlanDetailBreadcrumbProps) {
  return (
    <PageHeader>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/plans" />}>
              학습 계획
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{planTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </PageHeader>
  );
}

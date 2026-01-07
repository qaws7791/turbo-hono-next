import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/breadcrumb";
import { Link } from "react-router";

import type { PlanDetailSpace } from "../../model";

import { PageHeader } from "~/domains/app-shell";

type PlanDetailBreadcrumbProps = {
  space: PlanDetailSpace;
  planTitle: string;
};

/**
 * 플랜 상세 페이지 Breadcrumb 네비게이션
 *
 * - 스페이스 > 플랜 제목 경로 표시
 */
export function PlanDetailBreadcrumb({
  space,
  planTitle,
}: PlanDetailBreadcrumbProps) {
  return (
    <PageHeader>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to={`/spaces/${space.id}`} />}>
              {space.name}
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

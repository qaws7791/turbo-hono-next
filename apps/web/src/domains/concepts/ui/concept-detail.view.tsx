import { Badge } from "@repo/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/breadcrumb";
import { Button } from "@repo/ui/button";
import { TabNav, TabNavLink } from "@repo/ui/tab-nav";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, NavLink } from "react-router";

import { useConceptTabs } from "../application";
import { conceptsQueries } from "../concepts.queries";
import { getLatestConceptSource } from "../model";

import { ConceptHistoryTabContent } from "./concept-history-tab-content";
import { ConceptNoteTabContent } from "./concept-note-tab-content";
import { ConceptRelatedTabContent } from "./concept-related-tab-content";
import { ConceptReviewBadge } from "./concept-review-badge.badge";

import { PageBody, PageHeader } from "~/domains/app-shell";
import { spacesQueries } from "~/domains/spaces/spaces.queries";

export function ConceptDetailView({ conceptId }: { conceptId: string }) {
  const { data: detail } = useSuspenseQuery(conceptsQueries.detail(conceptId));
  const { concept, relatedConcepts } = detail;

  const { data: space } = useSuspenseQuery(
    spacesQueries.detail(concept.spaceId),
  );

  const related = relatedConcepts.slice(0, 6);

  const tabs = useConceptTabs(concept.id);
  const latestSource = getLatestConceptSource(concept);
  const reviewHref = latestSource
    ? `/session?runId=${latestSource.sessionRunId}`
    : null;

  return (
    <>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/concepts" />}>
                개념 라이브러리
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to={`/spaces/${space.id}`} />}>
                {space.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{concept.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeader>
      <PageBody className="mt-24 space-y-6 max-w-4xl">
        {/* 헤더 영역 */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-foreground text-2xl font-semibold">
              {concept.title}
            </h1>
            <p className="text-muted-foreground text-sm">{concept.oneLiner}</p>
          </div>
          <div className="flex items-center gap-2">
            <ConceptReviewBadge status={concept.reviewStatus} />
            {reviewHref ? (
              <Button render={<Link to={reviewHref} />}>복습 시작</Button>
            ) : (
              <Button disabled>복습 시작</Button>
            )}
          </div>
        </div>

        {/* 태그 영역 */}
        {concept.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {concept.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        {/* 탭 네비게이션 */}
        <TabNav>
          <TabNavLink
            render={<NavLink to={tabs.basePath} />}
            active={tabs.isNoteTab}
          >
            Ari 노트
          </TabNavLink>
          <TabNavLink
            render={<NavLink to={`${tabs.basePath}?tab=history`} />}
            active={tabs.isHistoryTab}
          >
            학습 이력
          </TabNavLink>
          <TabNavLink
            render={<NavLink to={`${tabs.basePath}?tab=related`} />}
            active={tabs.isRelatedTab}
          >
            연관 개념
          </TabNavLink>
        </TabNav>

        {/* 탭 컨텐츠 */}
        {tabs.isNoteTab && <ConceptNoteTabContent concept={concept} />}
        {tabs.isHistoryTab && <ConceptHistoryTabContent concept={concept} />}
        {tabs.isRelatedTab && <ConceptRelatedTabContent related={related} />}
      </PageBody>
    </>
  );
}

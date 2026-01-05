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
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@repo/ui/timeline";
import { Link, NavLink } from "react-router";

import { ConceptReviewBadge } from "./concept-review-badge.badge";

import type { ConceptDetailModel } from "../application/use-concept-detail-model";
import type { Concept } from "../model";
import type { Space } from "~/domains/spaces";

import { PageBody, PageHeader } from "~/domains/app-shell";
import { formatLongDateTime } from "~/foundation/lib/time";

// Ari 노트 탭 컨텐츠
function NoteTabContent({ concept }: { concept: Concept }) {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-sm font-medium">정의</h3>
        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
          {concept.definition}
        </p>
      </section>

      {concept.exampleCode ? (
        <section className="space-y-2">
          <h3 className="text-sm font-medium">예제</h3>
          <pre className="bg-muted overflow-x-auto rounded-xl p-4 text-sm">
            <code>{concept.exampleCode}</code>
          </pre>
        </section>
      ) : null}

      {concept.gotchas.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-sm font-medium">주의사항</h3>
          <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-sm">
            {concept.gotchas.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

// 학습 이력 탭 컨텐츠
function HistoryTabContent({ concept }: { concept: Concept }) {
  // 학습 이력을 최신순으로 정렬
  const sortedSources = [...concept.sources].sort(
    (a, b) => new Date(b.studiedAt).getTime() - new Date(a.studiedAt).getTime(),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">학습 이력</h3>
        <span className="text-muted-foreground text-xs">
          총 {sortedSources.length}회 학습
        </span>
      </div>

      {sortedSources.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          아직 학습 이력이 없습니다.
        </p>
      ) : (
        <Timeline defaultValue={sortedSources.length}>
          {sortedSources.map((source, index) => (
            <TimelineItem
              key={`${source.sessionId}-${index}`}
              step={index + 1}
            >
              <TimelineIndicator className="bg-background flex items-center justify-center">
                <div className="size-1.5 rounded-full bg-muted-foreground/40" />
              </TimelineIndicator>
              <TimelineSeparator />
              <TimelineHeader>
                <TimelineDate>
                  {formatLongDateTime(source.studiedAt)}
                </TimelineDate>
                <TimelineTitle>
                  <Link
                    to={`/session?runId=${source.sessionId}`}
                    className="hover:underline"
                  >
                    {source.sessionTitle}
                  </Link>
                </TimelineTitle>
              </TimelineHeader>
              <TimelineContent>
                <p className="text-muted-foreground text-xs">
                  {source.moduleTitle}
                </p>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </div>
  );
}

// 관련 Concept 탭 컨텐츠
function RelatedTabContent({ related }: { related: Array<Concept> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">관련 개념</h3>
        {related.length > 0 && (
          <span className="text-muted-foreground text-xs">
            {related.length}개
          </span>
        )}
      </div>

      {related.length === 0 ? (
        <p className="text-muted-foreground text-sm">관련된 개념이 없습니다.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {related.map((c) => (
            <Link
              key={c.id}
              to={`/concept/${c.id}`}
              className="rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.title}</div>
                  <div className="text-muted-foreground truncate text-xs">
                    {c.oneLiner}
                  </div>
                </div>
                <ConceptReviewBadge status={c.reviewStatus} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function ConceptDetailView({
  concept,
  space,
  related,
  model,
}: {
  concept: Concept;
  space: Space;
  related: Array<Concept>;
  model: ConceptDetailModel;
}) {
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
            {model.reviewHref ? (
              <Button render={<Link to={model.reviewHref} />}>복습 시작</Button>
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
            render={<NavLink to={model.basePath} />}
            active={model.isNoteTab}
          >
            Ari 노트
          </TabNavLink>
          <TabNavLink
            render={<NavLink to={`${model.basePath}?tab=history`} />}
            active={model.isHistoryTab}
          >
            학습 이력
          </TabNavLink>
          <TabNavLink
            render={<NavLink to={`${model.basePath}?tab=related`} />}
            active={model.isRelatedTab}
          >
            연관 개념
          </TabNavLink>
        </TabNav>

        {/* 탭 컨텐츠 */}
        {model.isNoteTab && <NoteTabContent concept={concept} />}
        {model.isHistoryTab && <HistoryTabContent concept={concept} />}
        {model.isRelatedTab && <RelatedTabContent related={related} />}
      </PageBody>
    </>
  );
}

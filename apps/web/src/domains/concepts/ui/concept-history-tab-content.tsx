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
import { Link } from "react-router";

import type { ConceptDetail } from "../model";

import { formatLongDateTime } from "~/foundation/lib/time";

interface ConceptHistoryTabContentProps {
  concept: ConceptDetail;
}

export function ConceptHistoryTabContent({
  concept,
}: ConceptHistoryTabContentProps) {
  const sources = concept.sources;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">학습 이력</h3>
        <span className="text-muted-foreground text-xs">
          총 {sources.length}회 학습
        </span>
      </div>

      {sources.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          아직 학습 이력이 없습니다.
        </p>
      ) : (
        <Timeline defaultValue={sources.length}>
          {sources.map((source, index) => (
            <TimelineItem
              key={`${source.sessionRunId}-${index}`}
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
                    to={`/session?runId=${source.sessionRunId}`}
                    className="hover:underline"
                  >
                    {source.sessionTitle}
                  </Link>
                </TimelineTitle>
              </TimelineHeader>
              <TimelineContent>
                <p className="text-muted-foreground text-xs">
                  {source.moduleTitle ?? source.planTitle}
                </p>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </div>
  );
}

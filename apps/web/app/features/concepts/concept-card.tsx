import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Separator } from "@repo/ui/separator";
import { Link } from "react-router";

import { ConceptReviewBadge } from "./concept-review-badge";
import { getLatestConceptSource } from "./get-latest-concept-source";

import type { Concept } from "~/mock/schemas";

export function ConceptCard({
  concept,
  showSource,
}: {
  concept: Concept;
  showSource: boolean;
}) {
  const latest = showSource ? getLatestConceptSource(concept) : null;

  return (
    <Link
      to={`/concept/${concept.id}`}
      className="block h-full group focus:outline-none"
    >
      <Card className="flex flex-col h-full transition-colors group-hover:bg-muted/50 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base truncate">
              {concept.title}
            </CardTitle>
            <ConceptReviewBadge status={concept.reviewStatus} />
          </div>
          <div className="text-muted-foreground text-sm">
            {concept.oneLiner}
          </div>
        </CardHeader>
        <CardContent className="mt-auto space-y-3">
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
          {showSource ? (
            <>
              <Separator />
              <div className="text-muted-foreground text-xs">
                출처:{" "}
                {latest ? (
                  <>
                    {latest.moduleTitle} · {latest.sessionTitle}
                  </>
                ) : (
                  "알 수 없음"
                )}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}

import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Link } from "react-router";

import { ConceptReviewBadge } from "./concept-review-badge";

import type { ConceptListItem, ConceptSearchItem } from "~/modules/concepts";

export function ConceptCard({
  concept,
}: {
  concept: ConceptListItem | ConceptSearchItem;
}) {
  const tags = "tags" in concept ? concept.tags : [];

  return (
    <Link
      to={`/concept/${concept.id}`}
      className="block h-full group focus:outline-none"
    >
      <Card className="flex flex-col h-full transition-colors group-hover:bg-muted/50 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            {"reviewStatus" in concept ? (
              <ConceptReviewBadge status={concept.reviewStatus} />
            ) : null}
            <CardTitle className="text-base truncate">
              {concept.title}
            </CardTitle>
          </div>
          <div className="text-muted-foreground text-sm">
            {concept.oneLiner}
          </div>
        </CardHeader>
        <CardContent className="mt-auto space-y-3">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}

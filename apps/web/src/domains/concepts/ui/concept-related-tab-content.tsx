import { Link } from "react-router";

import { ConceptReviewBadge } from "./concept-review-badge.badge";

import type { RelatedConcept } from "../model";

interface ConceptRelatedTabContentProps {
  related: Array<RelatedConcept>;
}

export function ConceptRelatedTabContent({
  related,
}: ConceptRelatedTabContentProps) {
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

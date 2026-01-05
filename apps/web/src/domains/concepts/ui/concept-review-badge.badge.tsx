import { Badge } from "@repo/ui/badge";

import type { ConceptReviewStatus } from "../model";

export function ConceptReviewBadge({
  status,
}: {
  status: ConceptReviewStatus;
}) {
  if (status === "good") return <Badge variant="secondary">양호</Badge>;
  if (status === "soon") return <Badge variant="outline">곧 복습</Badge>;
  return <Badge variant="destructive">복습 필요</Badge>;
}

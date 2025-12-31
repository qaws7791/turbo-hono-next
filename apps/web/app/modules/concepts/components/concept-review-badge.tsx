import { Badge } from "@repo/ui/badge";

import type { ConceptListItem } from "~/modules/concepts";

export function ConceptReviewBadge({
  status,
}: {
  status: ConceptListItem["reviewStatus"];
}) {
  if (status === "GOOD") return <Badge variant="secondary">양호</Badge>;
  if (status === "DUE") return <Badge variant="outline">복습 예정</Badge>;
  return <Badge variant="destructive">복습 필요</Badge>;
}

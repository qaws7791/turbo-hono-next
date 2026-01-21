import { Badge } from "@repo/ui/badge";

import type { PlanStatus } from "../model/types";

export function PlanStatusBadge({ status }: { status: PlanStatus }) {
  if (status === "active") return <Badge>활성</Badge>;
  if (status === "paused") return <Badge variant="outline">일시정지</Badge>;
  return <Badge variant="secondary">보관됨</Badge>;
}

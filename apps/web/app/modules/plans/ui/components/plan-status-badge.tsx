import { Badge } from "@repo/ui/badge";

import type { PlanStatus } from "../../domain";

export function PlanStatusBadge({ status }: { status: PlanStatus }) {
  if (status === "ACTIVE") return <Badge>활성</Badge>;
  if (status === "PAUSED") return <Badge variant="outline">일시정지</Badge>;
  if (status === "COMPLETED") return <Badge variant="secondary">완료</Badge>;
  return <Badge variant="secondary">보관됨</Badge>;
}

import { Badge } from "@repo/ui/badge";

import type { PlanStatus } from "~/mock/schemas";

export function PlanStatusBadge({ status }: { status: PlanStatus }) {
  if (status === "active") return <Badge>active</Badge>;
  if (status === "paused") return <Badge variant="outline">paused</Badge>;
  return <Badge variant="secondary">archived</Badge>;
}

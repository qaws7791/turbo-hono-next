import { Badge } from "@repo/ui/badge";

type SessionStatus = "todo" | "in_progress" | "completed";

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  if (status === "completed") return <Badge variant="secondary">완료됨</Badge>;
  return <Badge variant="outline">세션</Badge>;
}

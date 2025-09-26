import type { SubGoal } from "@/domains/roadmap/types";
import { Icon } from "@repo/ui/icon";

interface SubGoalItemProps {
  subGoal: SubGoal;
  index: number;
  className?: string;
  onToggleComplete?: (subGoalId: string, isCompleted: boolean) => void;
}

const formatDueDate = (dueDate?: string | null) => {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)}일 지남`, isOverdue: true };
  } else if (diffDays === 0) {
    return { text: "오늘 마감", isToday: true };
  } else if (diffDays <= 7) {
    return { text: `${diffDays}일 남음`, isUrgent: true };
  } else {
    return { text: date.toLocaleDateString("ko-KR"), isNormal: true };
  }
};

const SubGoalItem = ({
  subGoal,
  index,
  className,
  onToggleComplete,
}: SubGoalItemProps) => {
  const dueDateInfo = formatDueDate(subGoal.dueDate);

  const handleToggleComplete = () => {
    onToggleComplete?.(subGoal.id, !subGoal.isCompleted);
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border border-muted transition-colors ${className || ""}`}
    >
      <button
        className="pt-0.5 hover:scale-110 transition-transform shrink-0"
        onClick={handleToggleComplete}
        aria-label={subGoal.isCompleted ? "완료 해제" : "완료 표시"}
      >
        {subGoal.isCompleted ? (
          <Icon
            name="solar--check-circle-outline"
            type="iconify"
            className="h-4 w-4 text-green-600"
          />
        ) : (
          <Icon
            name="solar--stop-outline"
            type="iconify"
            className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
          />
        )}
      </button>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start gap-2">
          <span
            className={`text-sm font-medium shrink-0 ${
              subGoal.isCompleted
                ? "line-through text-muted-foreground"
                : "text-primary"
            }`}
          >
            {index}.
          </span>
          <div
            className={`text-sm font-medium min-w-0 flex-1 ${
              subGoal.isCompleted
                ? "line-through text-muted-foreground"
                : "text-foreground"
            }`}
            style={{ wordBreak: "break-word" }}
          >
            {subGoal.title}
          </div>
        </div>

        {subGoal.description && (
          <div
            className={`text-xs ml-6 leading-relaxed ${
              subGoal.isCompleted
                ? "line-through text-muted-foreground/80"
                : "text-muted-foreground"
            }`}
            style={{ wordBreak: "break-word" }}
          >
            {subGoal.description}
          </div>
        )}

        {(dueDateInfo || subGoal.memo) && (
          <div className="flex items-center gap-3 ml-6 text-xs text-muted-foreground">
            {dueDateInfo && (
              <div
                className={`flex items-center gap-1 ${
                  dueDateInfo.isOverdue
                    ? "text-destructive"
                    : dueDateInfo.isToday
                      ? "text-orange-600"
                      : dueDateInfo.isUrgent
                        ? "text-yellow-600"
                        : ""
                }`}
              >
                <Icon
                  name="solar--calendar-outline"
                  type="iconify"
                  className="h-3 w-3"
                />
                <span>{dueDateInfo.text}</span>
              </div>
            )}

            {subGoal.memo && (
              <div className="flex items-center gap-1">
                <Icon
                  name="solar--file-text-outline"
                  type="iconify"
                  className="h-3 w-3"
                />
                <span>메모</span>
              </div>
            )}
          </div>
        )}

        {subGoal.memo && (
          <div className="ml-6 p-2 bg-muted/30 rounded-md text-xs text-muted-foreground border-l-2 border-primary/20">
            {subGoal.memo}
          </div>
        )}
      </div>
    </div>
  );
};

export { SubGoalItem };

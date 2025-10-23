import { parseDate } from "@internationalized/date";
import { Button } from "@repo/ui/button";
import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarHeading,
} from "@repo/ui/calendar";
import { Icon } from "@repo/ui/icon";
import { Popover, PopoverDialog, PopoverTrigger } from "@repo/ui/popover";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";

import type { SubGoal } from "@/domains/roadmap/types";

import { Link } from "@/components/link";
import { formatSubGoalDueDate } from "@/domains/roadmap/utils/format-sub-goal-due-date";

interface SubGoalItemProps {
  subGoal: SubGoal;
  index: number;
  roadmapId: string;
  goalId: string;
  className?: string;
  onToggleComplete?: (subGoalId: string, isCompleted: boolean) => void;
  onUpdateDueDate?: (subGoalId: string, dueDate: string | null) => void;
  isUpdatingDueDate?: boolean;
}

const formatDateForInput = (dueDate?: string | null) => {
  if (!dueDate) return "";
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

interface SubGoalDueDateMenuProps {
  dueDate?: string | null;
  onSave: (value: string | null) => void;
  isDisabled?: boolean;
}

const SubGoalDueDateMenu = ({
  dueDate,
  onSave,
  isDisabled = false,
}: SubGoalDueDateMenuProps) => {
  const initialDateValue = React.useMemo(
    () => formatDateForInput(dueDate),
    [dueDate],
  );
  const [dateValue, setDateValue] = React.useState<string>(initialDateValue);
  const [isOpen, setIsOpen] = React.useState(false);
  const hasMountedRef = React.useRef(false);

  React.useEffect(() => {
    setDateValue(initialDateValue);
  }, [initialDateValue]);

  const calendarValue = React.useMemo(() => {
    if (!dateValue) return null;
    try {
      return parseDate(dateValue);
    } catch {
      return null;
    }
  }, [dateValue]);

  const isDirty = dateValue !== initialDateValue;

  const commitChanges = React.useCallback(() => {
    if (!onSave || !isDirty) return;

    const currentDueDate = dueDate ?? null;

    if (!dateValue) {
      if (currentDueDate !== null) {
        onSave(null);
      }
      return;
    }

    const candidate = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(candidate.getTime())) {
      if (currentDueDate !== null) {
        onSave(null);
      }
      return;
    }

    const nextValue = candidate.toISOString();
    if (nextValue !== currentDueDate) {
      onSave(nextValue);
    }
  }, [dateValue, dueDate, isDirty, onSave]);

  React.useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (!isOpen) {
      commitChanges();
    }
  }, [commitChanges, isOpen]);

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
  };

  const handleClear = (close: () => void) => {
    setDateValue("");
    close();
  };

  const buttonLabel = formatSubGoalDueDate(dueDate);
  const hasDueDate = Boolean(dueDate);

  return (
    <PopoverTrigger
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      data-prevent-subgoal-navigation="true"
    >
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs font-medium text-muted-foreground data-[hovered]:text-foreground"
        isDisabled={isDisabled}
        data-prevent-subgoal-navigation="true"
      >
        <div
          className={`flex items-center gap-1 ${
            buttonLabel.isOverdue
              ? "text-destructive"
              : buttonLabel.isToday
                ? "text-orange-600"
                : buttonLabel.isUrgent
                  ? "text-yellow-600"
                  : ""
          }`}
        >
          <Icon
            name="solar--calendar-outline"
            type="iconify"
            className="h-3 w-3"
          />
          <span>
            {buttonLabel.text}
            {buttonLabel.formattedDate &&
              buttonLabel.text !== buttonLabel.formattedDate && (
                <span className="ml-1 text-muted-foreground/80">
                  ({buttonLabel.formattedDate})
                </span>
              )}
          </span>
        </div>
      </Button>
      <Popover>
        <PopoverDialog data-prevent-subgoal-navigation="true">
          {({ close }) => (
            <div className="space-y-4">
              <Calendar
                aria-label="due date"
                value={calendarValue ?? undefined}
                onChange={(selectedDate) => {
                  setDateValue(selectedDate.toString());
                }}
                isDisabled={isDisabled}
              >
                <CalendarHeading />
                <CalendarGrid>
                  <CalendarGridHeader>
                    {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
                  </CalendarGridHeader>
                  <CalendarGridBody>
                    {(date) => <CalendarCell date={date} />}
                  </CalendarGridBody>
                </CalendarGrid>
              </Calendar>

              <div className="flex gap-2">
                {hasDueDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => handleClear(close)}
                    isDisabled={isDisabled}
                    data-prevent-subgoal-navigation="true"
                  >
                    마감일 제거
                  </Button>
                )}
              </div>
            </div>
          )}
        </PopoverDialog>
      </Popover>
    </PopoverTrigger>
  );
};

const SubGoalItem = ({
  subGoal,
  index,
  roadmapId,
  className,
  onToggleComplete,
  onUpdateDueDate,
  isUpdatingDueDate = false,
}: SubGoalItemProps) => {
  const navigate = useNavigate();

  const handleOpenDetail = React.useCallback(() => {
    navigate({
      to: "/app/roadmaps/$roadmapId/sub-goals/$subGoalId",
      params: { roadmapId, subGoalId: subGoal.id },
    });
  }, [navigate, roadmapId, subGoal.id]);

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("[data-prevent-subgoal-navigation='true']")
    ) {
      return;
    }

    handleOpenDetail();
  };

  const handleToggleComplete = () => {
    onToggleComplete?.(subGoal.id, !subGoal.isCompleted);
  };

  const handleDueDateSave = (value: string | null) => {
    if (!onUpdateDueDate) return;
    const currentDueDate = subGoal.dueDate ?? null;
    if (currentDueDate === value) return;
    onUpdateDueDate(subGoal.id, value);
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border border-muted transition-colors hover:bg-muted/40 cursor-pointer ${className || ""}`}
      onClick={handleContainerClick}
    >
      <button
        className="pt-0.5 hover:scale-110 transition-transform shrink-0"
        onClick={handleToggleComplete}
        aria-label={subGoal.isCompleted ? "완료 해제" : "완료 표시"}
        data-prevent-subgoal-navigation="true"
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
        <Link
          to="/app/roadmaps/$roadmapId/sub-goals/$subGoalId"
          params={{ roadmapId, subGoalId: subGoal.id }}
          className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors hover:bg-muted/60"
        >
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
            <div className="min-w-0 flex-1">
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
          </div>

          {subGoal.description && (
            <div
              className={`text-xs ml-6 mt-2 leading-relaxed ${
                subGoal.isCompleted
                  ? "line-through text-muted-foreground/80"
                  : "text-muted-foreground"
              }`}
              style={{ wordBreak: "break-word" }}
            >
              {subGoal.description}
            </div>
          )}
        </Link>

        <div className="flex items-center gap-3 ml-6 text-xs text-muted-foreground">
          <SubGoalDueDateMenu
            dueDate={subGoal.dueDate}
            onSave={handleDueDateSave}
            isDisabled={isUpdatingDueDate}
          />

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

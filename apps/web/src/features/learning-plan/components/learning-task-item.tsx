import * as React from "react";
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
import { cn } from "@repo/ui/utils";
import { useNavigate } from "@tanstack/react-router";

import type { LearningTask } from "@/features/learning-plan/model/types";

import { useDueDateMenu } from "@/features/learning-plan/hooks/use-due-date-menu";
import { formatLearningTaskDueDate } from "@/features/learning-plan/model/format-learning-task-due-date";
import { Link } from "@/shared/components/link";

interface LearningTaskItemProps {
  learningTask: LearningTask;
  index: number;
  learningPlanId: string;
  learningModuleId: string;
  className?: string;
  onToggleComplete?: (learningTaskId: string, isCompleted: boolean) => void;
  onUpdateDueDate?: (learningTaskId: string, dueDate: string | null) => void;
  isUpdatingDueDate?: boolean;
}

interface LearningTaskDueDateMenuProps {
  dueDate?: string | null;
  onSave: (value: string | null) => void;
  isDisabled?: boolean;
}

const LearningTaskDueDateMenu = ({
  dueDate,
  onSave,
  isDisabled = false,
}: LearningTaskDueDateMenuProps) => {
  const {
    setDateValue,
    calendarValue,
    isOpen,
    hasDueDate,
    handleOpenChange,
    handleClear,
  } = useDueDateMenu(dueDate, onSave);

  const buttonLabel = formatLearningTaskDueDate(dueDate);

  return (
    <PopoverTrigger
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      data-prevent-learningTask-navigation="true"
    >
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs font-medium text-muted-foreground data-[hovered]:text-foreground"
        isDisabled={isDisabled}
        data-prevent-learningTask-navigation="true"
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
        <PopoverDialog data-prevent-learningTask-navigation="true">
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
                    data-prevent-learningTask-navigation="true"
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

const LearningTaskItem = ({
  learningTask,
  index,
  learningPlanId,
  className,
  onToggleComplete,
  onUpdateDueDate,
  isUpdatingDueDate = false,
}: LearningTaskItemProps) => {
  const navigate = useNavigate();

  const handleOpenDetail = React.useCallback(() => {
    navigate({
      to: "/app/learning-plans/$learningPlanId/learning-tasks/$learningTaskId",
      params: { learningPlanId, learningTaskId: learningTask.id },
    });
  }, [navigate, learningPlanId, learningTask.id]);

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("[data-prevent-learningTask-navigation='true']")
    ) {
      return;
    }

    handleOpenDetail();
  };

  const handleToggleComplete = () => {
    onToggleComplete?.(learningTask.id, !learningTask.isCompleted);
  };

  const handleDueDateSave = (value: string | null) => {
    if (!onUpdateDueDate) return;
    const currentDueDate = learningTask.dueDate ?? null;
    if (currentDueDate === value) return;
    onUpdateDueDate(learningTask.id, value);
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border border-muted",
        "transition-colors hover:bg-muted/40 cursor-pointer",
        className,
      )}
      onClick={handleContainerClick}
    >
      <button
        className="pt-0.5 hover:scale-110 transition-transform shrink-0"
        onClick={handleToggleComplete}
        aria-label={learningTask.isCompleted ? "완료 해제" : "완료 표시"}
        data-prevent-learningTask-navigation="true"
      >
        {learningTask.isCompleted ? (
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
          to="/app/learning-plans/$learningPlanId/learning-tasks/$learningTaskId"
          params={{ learningPlanId, learningTaskId: learningTask.id }}
          className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors hover:bg-muted/60"
        >
          <div className="flex items-start gap-2">
            <span
              className={`text-sm font-medium shrink-0 ${
                learningTask.isCompleted
                  ? "line-through text-muted-foreground"
                  : "text-primary"
              }`}
            >
              {index}.
            </span>
            <div className="min-w-0 flex-1">
              <div
                className={`text-sm font-medium min-w-0 flex-1 ${
                  learningTask.isCompleted
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
                style={{ wordBreak: "break-word" }}
              >
                {learningTask.title}
              </div>
            </div>
          </div>

          {learningTask.description && (
            <div
              className={`text-xs ml-6 mt-2 leading-relaxed ${
                learningTask.isCompleted
                  ? "line-through text-muted-foreground/80"
                  : "text-muted-foreground"
              }`}
              style={{ wordBreak: "break-word" }}
            >
              {learningTask.description}
            </div>
          )}
        </Link>

        <div className="flex items-center gap-3 ml-6 text-xs text-muted-foreground">
          <LearningTaskDueDateMenu
            dueDate={learningTask.dueDate}
            onSave={handleDueDateSave}
            isDisabled={isUpdatingDueDate}
          />

          {learningTask.memo && (
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

        {learningTask.memo && (
          <div className="ml-6 p-2 bg-muted/30 rounded-md text-xs text-muted-foreground border-l-2 border-primary/20">
            {learningTask.memo}
          </div>
        )}
      </div>
    </div>
  );
};

export { LearningTaskItem };

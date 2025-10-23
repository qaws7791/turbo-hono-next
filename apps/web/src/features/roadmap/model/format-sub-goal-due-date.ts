interface FormattedDueDateLabel {
  text: string;
  formattedDate: string | null;
  isOverdue?: boolean;
  isToday?: boolean;
  isUrgent?: boolean;
  isNormal?: boolean;
}

const formatSubGoalDueDate = (
  dueDate?: string | null,
): FormattedDueDateLabel => {
  if (!dueDate) {
    return {
      text: "마감일 설정",
      isOverdue: false,
      formattedDate: null,
    };
  }

  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) {
    return {
      text: "마감일 설정",
      isOverdue: false,
      formattedDate: null,
    };
  }

  const now = new Date();
  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const formattedDate = date.toLocaleDateString("ko-KR");

  if (diffDays < 0) {
    return {
      text: `${Math.abs(diffDays)}일 지남`,
      isOverdue: true,
      formattedDate,
    };
  }

  if (diffDays === 0) {
    return {
      text: "오늘 마감",
      isToday: true,
      formattedDate,
    };
  }

  if (diffDays <= 7) {
    return {
      text: `${diffDays}일 남음`,
      isUrgent: true,
      formattedDate,
    };
  }

  return {
    text: formattedDate,
    isNormal: true,
    formattedDate,
  };
};

export type { FormattedDueDateLabel };
export { formatSubGoalDueDate };

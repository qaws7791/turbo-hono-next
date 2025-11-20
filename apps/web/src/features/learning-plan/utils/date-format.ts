/**
 * 문자열 날짜를 input용 YYYY-MM-DD 형식으로 변환
 */
export const formatDateForInput = (dueDate?: string | null): string => {
  if (!dueDate) return "";
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

/**
 * YYYY-MM-DD 문자열을 ISO 형식의 타임스탬프로 변환
 */
export const parseDateValue = (dateValue: string): string | null => {
  if (!dateValue) return null;

  const candidate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(candidate.getTime())) return null;

  return candidate.toISOString();
};

/**
 * 변경된 값이 실제로 다른지 확인
 */
export const isDueDateChanged = (
  currentDueDate: string | null,
  nextDueDate: string | null,
): boolean => {
  return currentDueDate !== nextDueDate;
};

import * as React from "react";
import { parseDate } from "@internationalized/date";

import {
  formatDateForInput,
  isDueDateChanged,
  parseDateValue,
} from "../utils/date-format";

interface UseDueDateMenuReturn {
  setDateValue: (value: string) => void;
  calendarValue: ReturnType<typeof parseDate> | null;
  isOpen: boolean;
  hasDueDate: boolean;
  handleOpenChange: (nextOpen: boolean) => void;
  handleClear: (close: () => void) => void;
}

/**
 * 마감일 메뉴의 상태와 로직을 관리하는 훅
 */
export const useDueDateMenu = (
  dueDate: string | null | undefined,
  onSave: (value: string | null) => void,
): UseDueDateMenuReturn => {
  const initialDateValue = React.useMemo(
    () => formatDateForInput(dueDate),
    [dueDate],
  );
  const [dateValue, setDateValue] = React.useState<string>(initialDateValue);
  const [isOpen, setIsOpen] = React.useState(false);
  const hasMountedRef = React.useRef(false);

  // 초기값 변경 시 동기화
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
    if (!isDirty) return;

    const currentDueDate = dueDate ?? null;
    const nextDueDate = parseDateValue(dateValue);

    if (isDueDateChanged(currentDueDate, nextDueDate)) {
      onSave(nextDueDate);
    }
  }, [dateValue, dueDate, isDirty, onSave]);

  // 팝오버 닫힐 때 변경사항 저장
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

  const hasDueDate = Boolean(dueDate);

  return {
    setDateValue,
    calendarValue,
    isOpen,
    hasDueDate,
    handleOpenChange,
    handleClear,
  };
};

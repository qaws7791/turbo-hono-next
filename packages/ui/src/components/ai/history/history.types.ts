import type { ComponentProps, ReactNode } from "react";
import type { ButtonProps } from "../../button";

/**
 * History 루트 컴포넌트 Props
 */
export type HistoryProps = ComponentProps<"div">;

/**
 * HistoryContent Props
 */
export type HistoryContentProps = ComponentProps<"div">;

/**
 * HistoryGroup Props
 */
export type HistoryGroupProps = ComponentProps<"div"> & {
  /**
   * 그룹 레이블 (예: "오늘", "어제", "지난 7일")
   */
  label: string;
  /**
   * 그룹 내 채팅 항목들
   */
  children: ReactNode;
};

/**
 * HistoryItem Props
 */
export type HistoryItemProps = ButtonProps & {
  /**
   * 선택 상태
   */
  selected?: boolean;
  /**
   * 채팅 제목/내용
   */
  children: ReactNode;
  /**
   * 메뉴 슬롯 (HistoryItemMenuTrigger)
   */
  menu?: ReactNode;
};

/**
 * HistoryItemMenuTrigger Props
 */
export type HistoryItemMenuTriggerProps = {
  /**
   * 메뉴 콘텐츠 (MenuPopover, Menu 등)
   */
  children: ReactNode;
  /**
   * 추가 클래스명
   */
  className?: string;
};

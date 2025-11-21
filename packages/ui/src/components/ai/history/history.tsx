"use client";

import { EllipsisIcon } from "lucide-react";
import { memo } from "react";

import { cn } from "../../../utils";
import { Button } from "../../button";
import { MenuTrigger } from "../../navigation/menu";

import type {
  HistoryContentProps,
  HistoryGroupProps,
  HistoryItemMenuTriggerProps,
  HistoryItemProps,
  HistoryProps,
} from "./history.types";

/**
 * History 루트 컴포넌트
 * 채팅 히스토리 전체 컨테이너
 */
export const History = memo(
  ({ className, children, ...props }: HistoryProps) => (
    <div
      className={cn("flex h-full w-full flex-col bg-background", className)}
      {...props}
    >
      {children}
    </div>
  ),
);

History.displayName = "History";

/**
 * HistoryContent 컴포넌트
 * 스크롤 가능한 메인 콘텐츠 영역
 */
export const HistoryContent = memo(
  ({ className, children, ...props }: HistoryContentProps) => (
    <div
      className={cn("flex-1 overflow-y-auto px-3 py-4", className)}
      role="list"
      {...props}
    >
      {children}
    </div>
  ),
);

HistoryContent.displayName = "HistoryContent";

/**
 * HistoryGroup 컴포넌트
 * 날짜별 그룹 (오늘, 어제, 지난 7일 등)
 */
export const HistoryGroup = memo(
  ({ className, label, children, ...props }: HistoryGroupProps) => (
    <div
      className={cn("mb-4 flex flex-col", className)}
      role="group"
      aria-label={label}
      {...props}
    >
      <div className="mb-2 px-3 text-xs font-medium text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  ),
);

HistoryGroup.displayName = "HistoryGroup";

/**
 * HistoryItem 컴포넌트
 * 개별 채팅 항목
 */
export const HistoryItem = memo(
  ({
    className,
    variant = "ghost",
    selected,
    menu,
    children,
    ...props
  }: HistoryItemProps) => (
    <div
      className={cn(
        "group relative flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
        "hover:bg-muted",
        "focus-within:bg-muted",
        selected && "bg-muted",
        className,
      )}
      role="listitem"
      aria-selected={selected}
    >
      <Button
        type="button"
        variant={variant}
        className={cn(
          "h-auto flex-1 justify-start truncate p-0 text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        )}
        {...props}
      >
        {children}
      </Button>
      {menu}
    </div>
  ),
);

HistoryItem.displayName = "HistoryItem";

/**
 * HistoryItemMenuTrigger 컴포넌트
 * 히스토리 아이템의 메뉴 트리거
 */
export const HistoryItemMenuTrigger = memo(
  ({ children, className }: HistoryItemMenuTriggerProps) => (
    <MenuTrigger>
      <Button
        type="button"
        variant="ghost"
        isIconOnly
        size="sm"
        className={cn(
          "absolute right-1 flex-shrink-0 text-muted-foreground opacity-0 transition-all",
          "group-hover:opacity-100",
          className,
        )}
        aria-label="더보기"
      >
        <EllipsisIcon className="size-4" />
      </Button>
      {children}
    </MenuTrigger>
  ),
);

HistoryItemMenuTrigger.displayName = "HistoryItemMenuTrigger";

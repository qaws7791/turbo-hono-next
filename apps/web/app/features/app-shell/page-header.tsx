"use client";

import { SidebarTrigger, useSidebar } from "@repo/ui/sidebar";
import { cn } from "@repo/ui/utils";

import type { ReactNode } from "react";

interface PageHeaderProps {
  children?: ReactNode;
}

/**
 * 페이지별 헤더 컴포넌트
 *
 * - SidebarTrigger는 사이드바가 닫혀있을 때만 자동으로 표시
 * - children으로 페이지별 헤더 콘텐츠(제목, 액션 버튼 등)를 전달
 * - 스크롤 상태에 따라 테두리 표시/숨김
 * - 아래로 스크롤 시 헤더 숨김, 위로 스크롤 시 표시
 */
export function PageHeader({ children }: PageHeaderProps) {
  const { open } = useSidebar();

  if (open && !children) {
    return <header className="h-11" />;
  }

  return (
    <header
      className={cn(
        // 기본 스타일
        "sticky top-0 z-10 h-11 flex p-2 gap-2 items-center",
        // 배경 및 블러
        "bg-background/80 backdrop-blur-md",
        // 스크롤 위치에 따른 보더 (CSS scroll-driven animation)
        "scroll-border",
        // 좌우 패딩
        open ? "px-4" : "px-2",
      )}
    >
      {!open && <SidebarTrigger />}
      {children}
    </header>
  );
}

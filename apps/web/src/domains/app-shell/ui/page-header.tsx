"use client";

import { SidebarTrigger, useSidebar } from "@repo/ui/sidebar";
import { cn } from "@repo/ui/utils";

import type { ReactNode } from "react";

interface PageHeaderProps {
  children?: ReactNode;
  /** SidebarTrigger 버튼을 숨길지 여부 (모바일 앱 스타일 뒤로가기 버튼 사용 시) */
  hideSidebarTrigger?: boolean;
}

/**
 * 페이지별 헤더 컴포넌트
 *
 * - SidebarTrigger는 사이드바가 닫혀있을 때만 자동으로 표시
 * - hideSidebarTrigger가 true면 SidebarTrigger를 숨김
 * - children으로 페이지별 헤더 콘텐츠(제목, 액션 버튼 등)를 전달
 * - 스크롤 상태에 따라 테두리 표시/숨김
 * - 아래로 스크롤 시 헤더 숨김, 위로 스크롤 시 표시
 */
export function PageHeader({
  children,
  hideSidebarTrigger = false,
}: PageHeaderProps) {
  const { open, isMobile } = useSidebar();

  if (open && !isMobile && !children && !hideSidebarTrigger) {
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
        open && !isMobile ? "px-4" : "px-2",
      )}
    >
      {!hideSidebarTrigger && (isMobile || !open) && <SidebarTrigger />}
      {children}
    </header>
  );
}

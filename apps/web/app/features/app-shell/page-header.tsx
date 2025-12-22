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
 */
export function PageHeader({ children }: PageHeaderProps) {
  const { open } = useSidebar();

  if (open && !children) {
    return <header className="h-14" />;
  }

  return (
    <header
      className={cn(
        "bg-background/10 sticky top-0 z-10 h-14 flex p-2 gap-2 backdrop-blur border-b items-center",
        open ? "px-4" : "px-2",
      )}
    >
      {!open && <SidebarTrigger />}
      {children}
    </header>
  );
}

import { cn } from "@repo/ui/utils";
import * as React from "react";

interface PageBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * 페이지 본문 레이아웃 컴포넌트
 *
 * - 공통적인 가로 폭(max-w-6xl), 패딩(px-12.5) 및 중앙 정렬(mx-auto)을 관리합니다.
 * - mt-*, space-y-* 등의 수직 레이아웃은 className prop으로 전달하여 커스터마이징할 수 있습니다.
 */
export function PageBody({ children, className, ...props }: PageBodyProps) {
  return (
    <div
      className={cn("px-4 md:px-10 max-w-6xl mx-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
}

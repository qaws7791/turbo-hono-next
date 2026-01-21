"use client";

import { cva } from "class-variance-authority";
import * as React from "react";

import type { VariantProps } from "class-variance-authority";

import { cn } from "@/utils";

const tabNavVariants = cva(
  "rounded-4xl p-[3px] h-9 group/tab-nav text-muted-foreground inline-flex w-fit items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface TabNavProps
  extends React.ComponentPropsWithoutRef<"nav">,
    VariantProps<typeof tabNavVariants> {}

function TabNav({ className, variant = "default", ...props }: TabNavProps) {
  return (
    <nav
      data-slot="tab-nav"
      data-variant={variant}
      className={cn(tabNavVariants({ variant }), className)}
      {...props}
    />
  );
}

const tabNavLinkStyles = [
  // 기본 스타일
  "gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium",
  "[&_svg:not([class*='size-'])]:size-4",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring",
  "text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground",
  "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap transition-all",
  "focus-visible:ring-[3px] focus-visible:outline-1",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  // line variant 스타일
  "group-data-[variant=line]/tab-nav:bg-transparent group-data-[variant=line]/tab-nav:data-active:bg-transparent",
  "dark:group-data-[variant=line]/tab-nav:data-active:border-transparent dark:group-data-[variant=line]/tab-nav:data-active:bg-transparent",
  // active 스타일
  "data-active:bg-background dark:data-active:text-foreground dark:data-active:border-input dark:data-active:bg-background data-active:text-foreground data-active:shadow-sm",
  // line variant의 underline 스타일
  "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity",
  "after:inset-x-0 after:bottom-[-5px] after:h-0.5",
  "group-data-[variant=line]/tab-nav:data-active:after:opacity-100",
].join(" ");

interface TabNavLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  /**
   * 현재 활성화된 탭인지 여부
   */
  active?: boolean;
  /**
   * 링크 렌더링에 사용할 커스텀 컴포넌트 (예: react-router의 NavLink)
   */
  render?: React.ReactElement;
}

function TabNavLink({
  className,
  active = false,
  render,
  children,
  ...props
}: TabNavLinkProps) {
  const sharedProps = {
    "data-slot": "tab-nav-link",
    "data-active": active || undefined,
    className: cn(tabNavLinkStyles, className),
    ...props,
  };

  if (render) {
    return React.cloneElement(render, sharedProps, children);
  }

  return <a {...sharedProps}>{children}</a>;
}

export { TabNav, TabNavLink, tabNavVariants };

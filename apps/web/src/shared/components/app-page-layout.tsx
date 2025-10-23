import { twMerge } from "@repo/ui/utils";

import type { ComponentPropsWithoutRef } from "react";

export function AppPageLayout({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={twMerge(
        "flex-1 bg-background p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-auto flex flex-col",
        className,
      )}
      {...props}
    />
  );
}

import { twMerge } from "@repo/ui/utils";
import React from "react";

export default function AppPageLayout({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
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

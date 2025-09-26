import { Button } from "@repo/ui/button";
import { Icon } from "@repo/ui/icon";
import { twMerge } from "@repo/ui/utils";
import type React from "react";

interface RoadmapInfoProps extends React.ComponentProps<"div"> {
  status: "active" | "archived" | undefined;
  createdAt: string;
  updatedAt: string;
}

export default function RoadmapInfo({
  status,
  createdAt,
  updatedAt,
  className,
}: RoadmapInfoProps) {
  return (
    <div className="flex items-center justify-between">
      <div
        className={twMerge(
          "flex items-center gap-4 text-sm text-muted-foreground",
          className,
        )}
      >
        <div className="flex items-center gap-1">
          <Icon
            name="solar--danger-circle-outline"
            type="iconify"
            className="size-4"
          />
          <div className="text-primary">{status}</div>
        </div>

        <div className="flex items-center gap-1">
          <Icon
            name="solar--calendar-outline"
            type="iconify"
            className="size-4"
          />
          <span>생성: {new Date(createdAt).toLocaleDateString("ko-KR")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon
            name="solar--clock-circle-outline"
            type="iconify"
            className="size-4"
          />
          <span>수정: {new Date(updatedAt).toLocaleDateString("ko-KR")}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
        >
          <Icon
            name="solar--settings-outline"
            type="iconify"
            className="size-4 mr-2"
          />
          설정
        </Button>
      </div>
    </div>
  );
}

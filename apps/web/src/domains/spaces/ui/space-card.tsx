import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Progress } from "@repo/ui/progress";
import { IconClock } from "@tabler/icons-react";

import { getColorByName, getIconByName } from "./icon-color-picker";

import type { SpaceCard as SpaceCardType } from "../model/spaces.types";

import { formatRelativeTime } from "~/foundation/lib/time";

interface SpaceCardProps {
  space: SpaceCardType;
}

export function SpaceCard({ space }: SpaceCardProps) {
  const IconComponent = getIconByName(space.icon);
  const colorData = getColorByName(space.color);

  return (
    <Card className="flex flex-col h-full transition-colors hover:bg-muted/50">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <IconComponent
            className="size-5 shrink-0"
            style={{ color: colorData?.value }}
          />
          <CardTitle className="text-base">{space.name}</CardTitle>
        </div>
        {space.description ? (
          <CardDescription>{space.description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="mt-auto space-y-3">
        {/* 활성 학습 계획 진행률 */}
        {space.activePlan ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium truncate">
                {space.activePlan.title}
              </div>
              <div className="text-muted-foreground text-xs">
                {space.activePlan.progressPercent}%
              </div>
            </div>
            <Progress value={space.activePlan.progressPercent} />
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            진행 중인 학습 계획이 없습니다.
          </div>
        )}

        {/* 마지막 학습 시간 */}
        {space.lastStudiedAt ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
            <IconClock className="size-3.5" />
            {formatRelativeTime(space.lastStudiedAt)} 학습
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

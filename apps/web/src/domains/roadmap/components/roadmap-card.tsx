"use client";
import { Progress } from "@repo/ui/progress-bar";
import { focusRing } from "@repo/ui/utils";
import { Calendar, Tag } from "lucide-react";
import * as React from "react";
import { Link, composeRenderProps } from "react-aria-components";
import { tv } from "tailwind-variants";

import type { LinkProps as AriaLinkProps } from "react-aria-components";
import type { VariantProps } from "tailwind-variants";


type RoadmapListItem = {
  id: string;
  emoji: string;
  title: string;
  description: string | null;
  status: "active" | "archived";
  goalCompletionPercent: number;
  learningTopic: string;
  userLevel: string;
  targetWeeks: number;
  weeklyHours: number;
  learningStyle: string;
  preferredResources: string;
  mainGoal: string;
  additionalRequirements: string | null;
  createdAt: string;
  updatedAt: string;
};

const roadmapCardVariants = tv({
  extend: focusRing,
  slots: {
    root: [
      "group relative bg-background border border-border rounded-lg p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-sm",
      /* Focused */
      "data-[focused]:ring-2 data-[focused]:ring-ring",
    ],
    header: "flex items-start justify-between mb-3",
    heading: "flex items-center gap-3",
    emoji: "text-2xl leading-none",
    title:
      "text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1",
    difficultyBadge: "px-2 py-1 rounded-full text-xs font-medium shrink-0",
    content: "space-y-3",
    description: "text-sm text-muted-foreground line-clamp-2",
    footer:
      "flex items-center justify-between pt-3 border-t border-border mt-4",
    learningInfo: "flex items-center gap-4 text-xs text-muted-foreground",
    infoItem: "flex items-center gap-1",
  },
  variants: {
    difficulty: {
      beginner: {
        difficultyBadge:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      },
      basic: {
        difficultyBadge:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      },
      intermediate: {
        difficultyBadge:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      },
      advanced: {
        difficultyBadge:
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      },
      expert: {
        difficultyBadge:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      },
    },
  },
  defaultVariants: {
    difficulty: "beginner",
  },
});

type RoadmapCardVariantProps = VariantProps<typeof roadmapCardVariants>;

type UserLevelMapping = {
  beginner: "초보자";
  basic: "기초";
  intermediate: "중급";
  advanced: "고급";
  expert: "전문가";
};

const userLevelMap: UserLevelMapping = {
  beginner: "초보자",
  basic: "기초",
  intermediate: "중급",
  advanced: "고급",
  expert: "전문가",
};

interface RoadmapCardProps extends Omit<AriaLinkProps, "children"> {
  roadmap: RoadmapListItem;
}

const RoadmapCard: React.FC<RoadmapCardProps> = ({
  roadmap,
  className,
  ...props
}) => {
  const userLevelKey = roadmap.userLevel as keyof UserLevelMapping;
  const slots = roadmapCardVariants({ difficulty: userLevelKey });
  const completionLabel = `${roadmap.goalCompletionPercent}% 완료`;
  const emoji = roadmap.emoji || "📚";
  const emojiLabel = `${roadmap.title} 로드맵 아이콘`;

  return (
    <Link
      href={`/app/roadmaps/${roadmap.id}`}
      className={composeRenderProps(className, (className, renderProps) =>
        slots.root({ ...renderProps, className }),
      )}
      {...props}
    >
      <div className={slots.header()}>
        <div className={slots.heading()}>
          <span
            className={slots.emoji()}
            role="img"
            aria-label={emojiLabel}
          >
            {emoji}
          </span>
          <h3 className={slots.title()}>{roadmap.title}</h3>
        </div>
        <div className={slots.difficultyBadge()}>
          {userLevelMap[userLevelKey] || roadmap.userLevel}
        </div>
      </div>

      <div className={slots.content()}>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <Tag className="w-4 h-4" />
          {roadmap.learningTopic}
        </div>

        {roadmap.description && (
          <p className={slots.description()}>{roadmap.description}</p>
        )}

        <div className={slots.learningInfo()}>
          <div className={slots.infoItem()}>
            <span>목표 기간:</span>
            <span className="font-medium">{roadmap.targetWeeks}주</span>
          </div>
          <div className={slots.infoItem()}>
            <span>주당:</span>
            <span className="font-medium">{roadmap.weeklyHours}시간</span>
          </div>
        </div>

        <Progress
          aria-label="로드맵 완료율"
          value={roadmap.goalCompletionPercent}
          minValue={0}
          maxValue={100}
          valueLabel={completionLabel}
          className="mt-3 flex flex-col gap-1"
        >
          {({ valueText }) => (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>진행률</span>
              <span className="font-medium text-foreground">{valueText}</span>
            </div>
          )}
        </Progress>
      </div>

      <div className={slots.footer()}>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {new Date(roadmap.createdAt).toLocaleDateString("ko-KR")}
        </div>

        <div className="text-xs text-muted-foreground">
          {roadmap.status === "active" ? "진행중" : "완료"}
        </div>
      </div>
    </Link>
  );
};

export { RoadmapCard, roadmapCardVariants };
export type { RoadmapCardProps, RoadmapCardVariantProps, RoadmapListItem };

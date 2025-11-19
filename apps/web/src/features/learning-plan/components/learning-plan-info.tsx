import { Button } from "@repo/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import { Icon } from "@repo/ui/icon";
import { Tooltip, TooltipTrigger } from "@repo/ui/tooltip";
import { cn } from "@repo/ui/utils";

import type React from "react";

interface LearningPlanInfoProps extends React.ComponentProps<"div"> {
  status: "active" | "archived" | undefined;
  createdAt: string;
  updatedAt: string;
  documents:
    | Array<{
        id: string;
        fileName: string;
        fileSize: number;
        fileType: string;
        learningPlanId: number | null;
        uploadedAt: string;
        createdAt: string;
      }>
    | undefined;
}

export default function LearningPlanInfo({
  status,
  createdAt,
  updatedAt,
  className,
  documents,
}: LearningPlanInfoProps) {
  return (
    <div className="flex items-center justify-between">
      <div
        className={cn(
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
        <DialogTrigger>
          <Button
            variant="outline"
            size="sm"
          >
            <Icon
              name="solar--documents-outline"
              type="iconify"
              className="size-4 mr-2"
            />
            문서
          </Button>
          <DialogOverlay>
            <DialogContent
              side="right"
              className="sm:max-w-[425px]"
            >
              {() => (
                <>
                  <DialogHeader>
                    <DialogTitle>문서 목록</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 w-full h-full">
                    {documents && documents.length > 0 ? (
                      documents.map((document) => (
                        <div
                          key={document.id}
                          className="flex gap-2 w-full"
                        >
                          <TooltipTrigger>
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                            >
                              <Icon
                                name="solar--document-outline"
                                type="iconify"
                                className="size-4 mr-2"
                              />
                              <span className="line-clamp-1 break-all text-ellipsis">
                                {document.fileName}
                              </span>
                            </Button>
                            <Tooltip
                              placement="bottom"
                              className="max-w-xs"
                            >
                              <p className="break-all">{document.fileName}</p>
                            </Tooltip>
                          </TooltipTrigger>
                        </div>
                      ))
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-muted-foreground">
                          문서가 없습니다.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
          </DialogOverlay>
        </DialogTrigger>

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

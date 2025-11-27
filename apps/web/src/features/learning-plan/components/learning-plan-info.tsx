import { Button } from "@repo/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import { Icon } from "@repo/ui/icon";
import { Label } from "@repo/ui/label";
import { Input, TextArea } from "@repo/ui/text-field";
import { Tooltip, TooltipTrigger } from "@repo/ui/tooltip";
import { cn } from "@repo/ui/utils";
import { useEffect, useState } from "react";

import type React from "react";

import { useLearningPlanUpdate } from "@/features/learning-plan/hooks/use-learning-plan-update";
import { formatDate } from "@/shared/utils";

interface LearningPlanInfoProps extends React.ComponentProps<"div"> {
  id: string;
  title: string;
  description?: string;
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
  id,
  title,
  description,
  status,
  createdAt,
  updatedAt,
  className,
  documents,
}: LearningPlanInfoProps) {
  const [newTitle, setNewTitle] = useState(title);
  const [newDescription, setNewDescription] = useState(description || "");
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: updateLearningPlan, isPending } = useLearningPlanUpdate(id);

  useEffect(() => {
    if (isOpen) {
      setNewTitle(title);
      setNewDescription(description || "");
    }
  }, [isOpen, title, description]);

  const handleSave = () => {
    updateLearningPlan(
      {
        title: newTitle,
        description: newDescription,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
      },
    );
  };

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
          <span>생성: {formatDate(createdAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon
            name="solar--clock-circle-outline"
            type="iconify"
            className="size-4"
          />
          <span>수정: {formatDate(updatedAt)}</span>
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

        <DialogTrigger
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        >
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
          <DialogOverlay>
            <DialogContent className="sm:max-w-[500px]">
              {({ close }) => (
                <>
                  <DialogHeader>
                    <DialogTitle>학습 계획 설정</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">제목</Label>
                      <Input
                        id="title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="학습 계획 제목을 입력하세요"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">설명</Label>
                      <TextArea
                        id="description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="학습 계획 설명을 입력하세요"
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={close}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleSave}
                      isDisabled={isPending}
                      isLoading={isPending}
                      loadingFallback="저장 중"
                    >
                      저장
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </DialogOverlay>
        </DialogTrigger>
      </div>
    </div>
  );
}

import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Progress } from "@repo/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Textarea } from "@repo/ui/textarea";
import * as React from "react";

import type { UploadProgress } from "../application/use-upload-material-mutation";

interface MaterialUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  progress: UploadProgress | null;
  onUpload: (file: File, title: string) => void;
}

/** 진행률 표시 컴포넌트 */
function UploadProgressIndicator({ progress }: { progress: UploadProgress }) {
  return (
    <div className="space-y-4 py-8">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="text-4xl animate-bounce">
          {getStepEmoji(progress.step)}
        </div>
        <p className="text-lg font-medium text-foreground">
          {progress.message}
        </p>
        <p className="text-sm text-muted-foreground">
          {progress.progress}% 완료
        </p>
      </div>
      <Progress
        value={progress.progress}
        className="h-2"
      />
    </div>
  );
}

/** 단계별 이모지 추출 */
function getStepEmoji(step: string): string {
  const emojiMap: Record<string, string> = {
    UPLOADING: "📤",
    PREPARING: "📋",
    VERIFYING: "🔍",
    LOADING: "📥",
    CHECKING: "🔎",
    STORING: "💾",
    ANALYZING: "🤖",
    FINALIZING: "✨",
    COMPLETED: "✅",
  };
  return emojiMap[step] || "⏳";
}

export function MaterialUploadDialog({
  isOpen,
  onOpenChange,
  isSubmitting,
  progress,
  onUpload,
}: MaterialUploadDialogProps) {
  // 파일 탭 state
  const [fileTitle, setFileTitle] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 텍스트 탭 state
  const [textTitle, setTextTitle] = React.useState("");
  const [textContent, setTextContent] = React.useState("");

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const finalTitle = fileTitle.trim() || file.name;
    onUpload(file, finalTitle);

    // Reset form
    setFileTitle("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim()) return;

    const finalTitle = textTitle.trim() || "텍스트 메모";
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const file = new File([blob], `${finalTitle}.txt`, { type: "text/plain" });

    onUpload(file, finalTitle);

    // Reset form
    setTextTitle("");
    setTextContent("");
  };

  const handleClose = () => {
    // 업로드 중에는 닫기 방지
    if (isSubmitting) return;

    onOpenChange(false);
    // Reset all forms
    setFileTitle("");
    setTextTitle("");
    setTextContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => (open ? onOpenChange(true) : handleClose())}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>자료 업로드</DialogTitle>
          <DialogDescription>
            {progress
              ? "업로드 및 분석이 진행 중입니다. 잠시만 기다려주세요."
              : "업로드 후 자동 분석됩니다. 분석 완료 문서만 학습 계획에 포함할 수 있습니다."}
          </DialogDescription>
        </DialogHeader>

        {/* 진행률 표시 (업로드 중일 때) */}
        {progress ? (
          <UploadProgressIndicator progress={progress} />
        ) : (
          <Tabs defaultValue="file">
            <TabsList className="w-full">
              <TabsTrigger
                value="file"
                className="flex-1"
              >
                파일
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="flex-1"
              >
                텍스트
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="file"
              className="mt-4"
            >
              <form
                onSubmit={handleFileSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="file-title">제목 (선택)</Label>
                  <Input
                    id="file-title"
                    name="title"
                    placeholder="문서 제목"
                    value={fileTitle}
                    onChange={(e) => setFileTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">파일</Label>
                  <input
                    ref={fileInputRef}
                    id="file"
                    name="file"
                    type="file"
                    className="w-full text-sm"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  업로드
                </Button>
              </form>
            </TabsContent>

            <TabsContent
              value="text"
              className="mt-4"
            >
              <form
                onSubmit={handleTextSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="text-title">제목 (선택)</Label>
                  <Input
                    id="text-title"
                    name="title"
                    placeholder="텍스트 메모"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text-content">내용</Label>
                  <Textarea
                    id="text-content"
                    name="content"
                    placeholder="학습할 텍스트를 입력하세요..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={8}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || !textContent.trim()}
                  className="w-full"
                >
                  업로드
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

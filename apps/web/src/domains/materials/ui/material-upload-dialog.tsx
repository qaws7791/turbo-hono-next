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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Textarea } from "@repo/ui/textarea";
import * as React from "react";

interface MaterialUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onUpload: (file: File, title: string) => void;
}

export function MaterialUploadDialog({
  isOpen,
  onOpenChange,
  isSubmitting,
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
            업로드 후 자동 분석됩니다. 분석 완료 문서만 학습 계획에 포함할 수
            있습니다.
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}

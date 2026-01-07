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
  const [title, setTitle] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const finalTitle = title.trim() || file.name;
    onUpload(file, finalTitle);

    // Reset form
    setTitle("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTitle("");
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
              value="url"
              className="flex-1"
              disabled
            >
              URL
            </TabsTrigger>
            <TabsTrigger
              value="text"
              className="flex-1"
              disabled
            >
              텍스트
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="file"
            className="mt-4"
          >
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="file-title">제목 (선택)</Label>
                <Input
                  id="file-title"
                  name="title"
                  placeholder="문서 제목"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
            value="url"
            className="mt-4"
          >
            <div className="text-muted-foreground rounded-xl border border-border bg-muted/30 p-4 text-sm">
              현재는 URL 업로드를 지원하지 않습니다.
            </div>
          </TabsContent>

          <TabsContent
            value="text"
            className="mt-4"
          >
            <div className="text-muted-foreground rounded-xl border border-border bg-muted/30 p-4 text-sm">
              현재는 텍스트 업로드를 지원하지 않습니다.
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

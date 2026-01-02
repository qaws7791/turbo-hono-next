import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Separator } from "@repo/ui/separator";
import * as React from "react";

import {
  documentKindLabel,
  documentStatusBadgeVariant,
  documentStatusLabel,
} from "../domain";

import type { MaterialListItem } from "~/modules/materials";

export function SpaceDocumentsView({
  documents,
  onDelete,
  onUploadFile,
  isSubmitting,
}: {
  documents: Array<MaterialListItem>;
  onDelete: (materialId: string) => void;
  onUploadFile: (input: { file: File; title?: string }) => void;
  isSubmitting: boolean;
}) {
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const openUpload = () => setUploadOpen(true);
  const closeUpload = () => setUploadOpen(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-foreground text-xl font-semibold">문서</h2>
          <p className="text-muted-foreground text-sm">
            자료를 업로드하면 AI가 자동으로 분석합니다. 학습 계획은 자동으로
            바뀌지 않습니다.
          </p>
        </div>
        <Button onClick={openUpload}>자료 업로드</Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">자료를 업로드해보세요</CardTitle>
            <CardDescription>
              PDF 등 학습 자료를 올리면 분석 후 학습 계획 생성을 시작할 수
              있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openUpload}>자료 업로드</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((material) => (
            <Card key={material.id}>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={documentStatusBadgeVariant(
                      material.processingStatus,
                    )}
                  >
                    {documentStatusLabel(material.processingStatus)}
                  </Badge>
                  <CardDescription>
                    {documentKindLabel(material.sourceType)} · 태그{" "}
                    {material.tags.length}개
                  </CardDescription>
                </div>
                <CardTitle className="text-base line-clamp-2">
                  {material.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {material.summary ? (
                  <div className="text-muted-foreground text-sm line-clamp-4">
                    {material.summary}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    요약은 분석 완료 후 표시됩니다.
                  </div>
                )}

                {material.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {material.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                <Separator />

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isSubmitting}
                    onClick={() => onDelete(material.id)}
                  >
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={uploadOpen}
        onOpenChange={(open) => (open ? openUpload() : closeUpload())}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>자료 업로드</DialogTitle>
            <DialogDescription>
              업로드 후 자동 분석됩니다. 분석 완료 문서만 학습 계획에 포함할 수
              있습니다.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const file = formData.get("file");
              if (!(file instanceof File)) return;

              const titleRaw = String(formData.get("title") ?? "").trim();
              onUploadFile({
                file,
                title: titleRaw.length > 0 ? titleRaw : undefined,
              });
              closeUpload();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="file-title">제목 (선택)</Label>
              <Input
                id="file-title"
                name="title"
                placeholder="문서 제목"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">파일</Label>
              <input
                id="file"
                name="file"
                type="file"
                className="w-full text-sm"
                accept=".pdf,.docx,.md,.markdown,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,text/plain"
                required
              />
              <p className="text-muted-foreground text-xs">
                지원 형식: PDF, DOCX, Markdown, TXT
              </p>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              업로드
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

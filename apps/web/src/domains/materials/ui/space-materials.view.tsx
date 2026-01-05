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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import * as React from "react";

import { useMaterialMutations } from "../application";
import { materialKindLabel, materialStatusLabel } from "../model";

import type { SpaceMaterialsModel } from "../application/use-space-materials-model";
import type { Material } from "../model/materials.types";

function materialStatusBadgeVariant(
  status: Material["status"],
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "completed") return "secondary";
  if (status === "error") return "destructive";
  return "outline";
}

export function SpaceMaterialsView({
  spaceId,
  materials,
  model,
}: {
  spaceId: string;
  materials: Array<Material>;
  model: SpaceMaterialsModel;
}) {
  const { isSubmitting, deleteMaterial, uploadFileMaterial } =
    useMaterialMutations(spaceId);
  const [title, setTitle] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const finalTitle = title.trim() || file.name;
    uploadFileMaterial(file, finalTitle);
    model.closeUpload();
    setTitle("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = (materialId: string) => {
    deleteMaterial(materialId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-foreground text-xl font-semibold">자료</h2>
          <p className="text-muted-foreground text-sm">
            자료를 업로드하면 AI가 자동으로 분석합니다. 학습 계획은 자동으로
            바뀌지 않습니다.
          </p>
        </div>
        <Button onClick={model.openUpload}>자료 업로드</Button>
      </div>

      {materials.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">자료를 업로드해보세요</CardTitle>
            <CardDescription>
              파일을 올리면 분석 후 학습 계획 생성을 시작할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={model.openUpload}>자료 업로드</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {materials.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base truncate">
                    {doc.title}
                  </CardTitle>
                  <Badge variant={materialStatusBadgeVariant(doc.status)}>
                    {materialStatusLabel(doc.status)}
                  </Badge>
                </div>
                <CardDescription>
                  {materialKindLabel(doc.kind)} · 태그 {doc.tags.length}개
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {doc.summary ? (
                  <div className="text-muted-foreground text-sm">
                    {doc.summary}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    요약은 분석 완료 후 표시됩니다.
                  </div>
                )}

                {doc.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.map((tag) => (
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
                    onClick={() => handleDelete(doc.id)}
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
        open={model.uploadOpen}
        onOpenChange={(open) =>
          open ? model.openUpload() : model.closeUpload()
        }
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
                onSubmit={handleUploadSubmit}
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
    </div>
  );
}

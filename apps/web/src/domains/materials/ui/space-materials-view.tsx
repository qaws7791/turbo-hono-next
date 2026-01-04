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
import { useFetcher } from "react-router";

import {
  materialKindLabel,
  materialStatusBadgeVariant,
  materialStatusLabel,
} from "../model";

import type { Document } from "~/app/mocks/schemas";
import type { SpaceMaterialsModel } from "../application/use-space-materials-model";

export function SpaceMaterialsView({
  materials,
  model,
}: {
  materials: Array<Document>;
  model: SpaceMaterialsModel;
}) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";

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

                <fetcher.Form
                  method="post"
                  className="flex justify-end"
                >
                  <input
                    type="hidden"
                    name="intent"
                    value="delete"
                  />
                  <input
                    type="hidden"
                    name="materialId"
                    value={doc.id}
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    disabled={isSubmitting}
                  >
                    삭제
                  </Button>
                </fetcher.Form>
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
              <fetcher.Form
                method="post"
                encType="multipart/form-data"
                className="space-y-4"
              >
                <input
                  type="hidden"
                  name="intent"
                  value="upload-file"
                />
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
              </fetcher.Form>
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

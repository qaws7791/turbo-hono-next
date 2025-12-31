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
import { IconClock } from "@tabler/icons-react";
import { Link } from "react-router";

import { formatRelativeTime } from "~/lib/time";
import { PageBody, PageHeader } from "~/modules/app-shell";
import { getColorByName, getIconByName } from "../components/icon-color-picker";

import type { SpacesModel } from "../models/use-spaces-model";

export function SpacesView({
  model,
  onCreateSpace,
  isCreating,
}: {
  model: SpacesModel;
  onCreateSpace: (input: { name: string; description?: string }) => void;
  isCreating: boolean;
}) {
  return (
    <>
      <PageHeader />
      <PageBody className="space-y-12 mt-24">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-medium">스페이스</h1>
            <p className="text-muted-foreground text-sm mt-1">
              학습 목표를 스페이스로 분리하고, 각 스페이스에서 문서/학습 계획을
              관리합니다.
            </p>
          </div>
          <Button onClick={model.openCreate}>+ 스페이스 만들기</Button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between items-end">
          <div className="w-full sm:max-w-sm">
            <Input
              value={model.query}
              onChange={(e) => model.setQuery(e.target.value)}
              placeholder="스페이스 검색"
            />
          </div>
          <div className="text-muted-foreground text-sm">
            {model.filtered.length}개 표시
          </div>
        </div>

        {model.filtered.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                첫 번째 학습 공간을 만들어보세요
              </CardTitle>
              <CardDescription>
                스페이스는 하나의 학습 목표를 담는 컨테이너입니다. 예:
                &ldquo;프론트엔드 마스터하기&rdquo;
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={model.openCreate}>+ 스페이스 만들기</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {model.filtered.map((space) => (
              <Link
                key={space.id}
                to={`/spaces/${space.id}`}
                className="block"
              >
                <Card className="flex flex-col h-full transition-colors hover:bg-muted/50">
                  <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = getIconByName(
                          space.icon ?? "book",
                        );
                        const colorData = getColorByName(space.color ?? "blue");
                        return (
                          <IconComponent
                            className="size-5 shrink-0"
                            style={{ color: colorData?.value }}
                          />
                        );
                      })()}
                      <CardTitle className="text-base">{space.name}</CardTitle>
                    </div>
                    {space.description ? (
                      <CardDescription>{space.description}</CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent className="mt-auto space-y-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                      <IconClock className="size-3.5" />
                      {formatRelativeTime(space.createdAt)} 생성
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <Dialog
          open={model.createOpen}
          onOpenChange={(next) =>
            next ? model.openCreate() : model.closeCreate()
          }
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>스페이스 만들기</DialogTitle>
              <DialogDescription>
                최소 입력으로 시작하고, 필요한 정보는 나중에 추가할 수 있습니다.
              </DialogDescription>
            </DialogHeader>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const name = String(formData.get("name") ?? "").trim();
                const descriptionRaw = String(
                  formData.get("description") ?? "",
                ).trim();
                const description =
                  descriptionRaw.length > 0 ? descriptionRaw : undefined;
                onCreateSpace({ name, description });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="예: Work"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명 (선택)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="학습 의도"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={model.closeCreate}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isCreating}
                >
                  {isCreating ? "생성 중" : "생성"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageBody>
    </>
  );
}

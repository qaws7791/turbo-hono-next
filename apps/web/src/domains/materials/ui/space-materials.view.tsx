import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
  useDeleteMaterialMutation,
  useUploadMaterialMutation,
} from "../application";
import { materialsQueries } from "../materials.queries";

import { MaterialCard } from "./material-card";
import { MaterialUploadDialog } from "./material-upload-dialog";

import { useDialogState } from "~/foundation/hooks/use-dialog-state";

export function SpaceMaterialsView({ spaceId }: { spaceId: string }) {
  const { data: materials } = useSuspenseQuery(
    materialsQueries.listForSpace(spaceId),
  );
  const uploadDialog = useDialogState();
  const uploadMaterialMutation = useUploadMaterialMutation(spaceId);
  const deleteMaterialMutation = useDeleteMaterialMutation(spaceId);

  const isSubmitting =
    uploadMaterialMutation.isPending || deleteMaterialMutation.isPending;

  const handleUpload = (file: File, title: string) => {
    uploadMaterialMutation.mutate(
      { file, title },
      {
        onSuccess: () => {
          uploadDialog.close();
        },
      },
    );
  };

  const handleDelete = (materialId: string) => {
    deleteMaterialMutation.mutate(materialId);
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
        <Button onClick={uploadDialog.open}>자료 업로드</Button>
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
            <Button onClick={uploadDialog.open}>자료 업로드</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {materials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              isDeleting={isSubmitting}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <MaterialUploadDialog
        isOpen={uploadDialog.isOpen}
        onOpenChange={(open) =>
          open ? uploadDialog.open() : uploadDialog.close()
        }
        isSubmitting={isSubmitting}
        onUpload={handleUpload}
      />
    </div>
  );
}

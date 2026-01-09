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

import { PageBody, PageHeader } from "~/domains/app-shell";
import { useDialogState } from "~/foundation/hooks/use-dialog-state";

export function MaterialsListView() {
  const { data: materials } = useSuspenseQuery(materialsQueries.list());
  const uploadDialog = useDialogState();
  const uploadMaterialMutation = useUploadMaterialMutation();
  const deleteMaterialMutation = useDeleteMaterialMutation();

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

  return (
    <>
      <PageHeader />
      <PageBody className="space-y-8 mt-24">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">학습 자료</h1>
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
          <div className="grid gap-4">
            {materials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
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
      </PageBody>
    </>
  );
}

import { Button } from "@repo/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useCreateSpaceMutation } from "../application";
import { spacesQueries } from "../spaces.queries";

import { CreateSpaceDialog } from "./create-space-dialog";
import { SpaceGridList } from "./space-grid-list";
import { SpaceGridListEmptyState } from "./space-grid-list-empty-state";

import { PageBody, PageHeader } from "~/domains/app-shell";
import { useDialogState } from "~/foundation/hooks/use-dialog-state";

export function SpacesView() {
  const { data: spaces } = useSuspenseQuery(spacesQueries.listCards());
  const createDialog = useDialogState();
  const { mutateAsync: createSpace } = useCreateSpaceMutation();

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
          <Button onClick={createDialog.open}>+ 스페이스 만들기</Button>
        </div>

        {spaces.length === 0 ? (
          <SpaceGridListEmptyState onCreateClick={createDialog.open} />
        ) : (
          <SpaceGridList spaces={spaces} />
        )}

        <CreateSpaceDialog
          isOpen={createDialog.isOpen}
          onOpenChange={createDialog.setOpen}
          onSubmit={async (data) => {
            await createSpace(data);
          }}
        />
      </PageBody>
    </>
  );
}

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import { IconFileDescription } from "@tabler/icons-react";

import type { PlanSourceMaterial } from "../../model";

type SourceMaterialsDialogProps = {
  materials: Array<PlanSourceMaterial>;
};

/**
 * 참조 자료 목록 다이얼로그
 *
 * - 플랜이 참조하는 자료 목록 표시
 * - 각 자료의 제목, 요약, 종류 표시
 */
export function SourceMaterialsDialog({
  materials,
}: SourceMaterialsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>
        <IconFileDescription />
        참조 자료
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>참조 자료</DialogTitle>
          <DialogDescription>
            이 학습 계획이 참조하고 있는 자료 목록입니다.
          </DialogDescription>
        </DialogHeader>
        <ul className="divide-y divide-border max-h-80 overflow-y-auto">
          {materials.length === 0 ? (
            <li className="py-3 text-center text-muted-foreground text-sm">
              참조 자료가 없습니다.
            </li>
          ) : (
            materials.map((doc) => (
              <li
                key={doc.id}
                className="py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {doc.title}
                    </div>
                    {doc.summary && (
                      <div className="text-muted-foreground truncate text-xs mt-0.5">
                        {doc.summary}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0"
                  >
                    {doc.kind === "file" ? "파일" : "텍스트"}
                  </Badge>
                </div>
              </li>
            ))
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

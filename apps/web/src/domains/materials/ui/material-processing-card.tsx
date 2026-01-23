import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Progress } from "@repo/ui/progress";
import { Spinner } from "@repo/ui/spinner";

import { getMaterialStatusBadgeVariant, materialStatusLabel } from "../model";

import type { Material } from "../model/materials.types";

type MaterialProcessingCardProps = {
  material: Material;
};

function clampPercent(value: number | null): number {
  if (value === null || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getProcessingMessage(material: Material): string {
  if (material.processingStep) {
    // 한글 메시지 매핑
    const stepMessages: Record<string, string> = {
      PREPARING: "업로드 준비 중입니다...",
      VERIFYING: "파일 확인 중입니다...",
      LOADING: "파일 불러오는 중입니다...",
      CHECKING: "기존 자료와 비교 중입니다...",
      STORING: "파일 저장 중입니다...",
      ANALYZING: "학습 자료 분석 중입니다...",
      FINALIZING: "마무리 중입니다...",
    };
    return stepMessages[material.processingStep] ?? "처리 중입니다...";
  }

  if (material.status === "pending") return "분석 대기 중입니다...";
  if (material.status === "analyzing") return "자료를 분석하고 있습니다...";
  return "처리 중입니다...";
}

export function MaterialProcessingCard({
  material,
}: MaterialProcessingCardProps) {
  const isProcessing =
    material.status === "pending" || material.status === "analyzing";
  const progressValue = clampPercent(material.processingProgress);
  const message = getProcessingMessage(material);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base truncate">{material.title}</CardTitle>
          <Badge variant={getMaterialStatusBadgeVariant(material.status)}>
            {materialStatusLabel(material.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isProcessing ? <Spinner className="size-4" /> : null}
          <span className="truncate">{message}</span>
        </div>
        <div className="space-y-2">
          <Progress value={progressValue} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{material.processingStep ?? "PROCESSING"}</span>
            <span>{progressValue}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

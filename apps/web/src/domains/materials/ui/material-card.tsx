import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Separator } from "@repo/ui/separator";

import {
  getMaterialStatusBadgeVariant,
  materialKindLabel,
  materialStatusLabel,
} from "../model";

import type { Material } from "../model/materials.types";

interface MaterialCardProps {
  material: Material;
  isDeleting: boolean;
  onDelete: (materialId: string) => void;
}

export function MaterialCard({
  material,
  isDeleting,
  onDelete,
}: MaterialCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base truncate">{material.title}</CardTitle>
          <Badge variant={getMaterialStatusBadgeVariant(material.status)}>
            {materialStatusLabel(material.status)}
          </Badge>
        </div>
        <CardDescription>
          {materialKindLabel(material.kind)} · 태그 {material.tags.length}개
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {material.summary ? (
          <div className="text-muted-foreground text-sm">
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
            disabled={isDeleting}
            onClick={() => onDelete(material.id)}
          >
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

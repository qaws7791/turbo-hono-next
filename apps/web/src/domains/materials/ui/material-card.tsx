import { Badge } from "@repo/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";

import {
  getMaterialStatusBadgeVariant,
  materialKindLabel,
  materialStatusLabel,
} from "../model";

import type { Material } from "../model/materials.types";

interface MaterialCardProps {
  material: Material;
}

export function MaterialCard({ material }: MaterialCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base truncate">{material.title}</CardTitle>
          <Badge variant={getMaterialStatusBadgeVariant(material.status)}>
            {materialStatusLabel(material.status)}
          </Badge>
        </div>
        <CardDescription>{materialKindLabel(material.kind)}</CardDescription>
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
      </CardContent>
    </Card>
  );
}

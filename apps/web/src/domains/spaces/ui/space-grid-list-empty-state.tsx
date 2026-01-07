import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";

interface SpaceGridListEmptyStateProps {
  onCreateClick: () => void;
}

export function SpaceGridListEmptyState({
  onCreateClick,
}: SpaceGridListEmptyStateProps) {
  return (
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
        <Button onClick={onCreateClick}>+ 스페이스 만들기</Button>
      </CardContent>
    </Card>
  );
}

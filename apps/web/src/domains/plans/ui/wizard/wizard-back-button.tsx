import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/alert-dialog";
import { Button } from "@repo/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";

import type { PlanWizardStep } from "../../model";

interface WizardBackButtonProps {
  step: PlanWizardStep;
  onBack: () => void;
  onExit: () => void;
}

/**
 * 위저드 뒤로가기 버튼 (모바일 앱 스타일)
 *
 * - 첫 스탭: Alert 확인 후 페이지 나가기
 * - 2스탭 이상: 이전 스탭으로 즉시 이동
 */
export function WizardBackButton({
  step,
  onBack,
  onExit,
}: WizardBackButtonProps) {
  // 첫 스탭: Alert 확인 후 나가기
  if (step === 1) {
    return (
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
            >
              <IconArrowLeft className="size-5" />
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              학습 계획 생성을 취소하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription>
              입력한 내용이 저장되지 않습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>계속 작성</AlertDialogCancel>
            <AlertDialogAction onClick={onExit}>나가기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // 2스탭 이상: 바로 이전 스탭으로 이동
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onBack}
    >
      <IconArrowLeft className="size-5" />
    </Button>
  );
}

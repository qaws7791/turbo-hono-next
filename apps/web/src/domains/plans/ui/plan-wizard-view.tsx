import { Card, CardContent } from "@repo/ui/card";
import { Separator } from "@repo/ui/separator";

import { usePlanWizard } from "../application";

import {
  StepMaterialSelect,
  StepScheduleSetting,
  WizardBackButton,
  WizardFooter,
  WizardHeader,
} from "./wizard";

import { PageBody, PageHeader } from "~/domains/app-shell";

/**
 * Step 2: 기한 및 요구사항 설정 단계
 * - 목표 기한 설정 (adaptive / custom)
 * - 특별 요구사항 입력
 */
export function PlanWizardView() {
  const wizard = usePlanWizard();

  return (
    <>
      <PageHeader hideSidebarTrigger>
        <WizardBackButton
          step={wizard.model.step}
          onBack={wizard.model.goBack}
          onExit={wizard.handleExit}
        />
      </PageHeader>
      <PageBody className="space-y-8">
        <WizardTitle />
        <Card>
          <WizardHeader
            step={wizard.model.step}
            error={wizard.model.error}
          />
          <CardContent className="space-y-6">
            {wizard.model.step === 1 && (
              <StepMaterialSelect
                model={wizard.model}
                materialsCount={wizard.materials.length}
              />
            )}
            {wizard.model.step === 2 && (
              <StepScheduleSetting model={wizard.model} />
            )}
            <Separator />
            <WizardFooter
              step={wizard.model.step}
              isSubmitting={wizard.isSubmitting}
              onNext={wizard.model.goNext}
              onSubmit={wizard.model.submit}
            />
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}

/**
 * 위저드 타이틀 컴포넌트
 */
function WizardTitle() {
  return (
    <div className="space-y-1">
      <h2 className="text-foreground text-xl font-semibold">학습 계획 생성</h2>
      <p className="text-muted-foreground text-sm">
        2단계로 1분 내 학습 계획을 생성합니다.
      </p>
    </div>
  );
}

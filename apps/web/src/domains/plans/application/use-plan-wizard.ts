import { useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import { useNavigate } from "react-router";

import { useCreatePlanMutation } from "./use-create-plan-mutation";
import { usePlanWizardForm } from "./use-plan-wizard-form";

import { materialsQueries } from "~/domains/materials";

/**
 * PlanWizard에서 필요한 모든 상태와 핸들러를 통합 제공하는 훅
 * - 자료 데이터 페칭
 * - 폼 상태 관리
 * - Mutation 상태
 * - 네비게이션 핸들러
 */
export function usePlanWizard() {
  const navigate = useNavigate();
  const { data: materials } = useSuspenseQuery(materialsQueries.list());
  const { isSubmitting, createPlan } = useCreatePlanMutation();
  const model = usePlanWizardForm({
    materials,
    submitPlan: createPlan,
  });

  const handleExit = React.useCallback(() => {
    navigate("/plans");
  }, [navigate]);

  return {
    model,
    isSubmitting,
    materials,
    handleExit,
  };
}

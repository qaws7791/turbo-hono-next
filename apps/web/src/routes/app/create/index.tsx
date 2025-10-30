import { createFileRoute } from "@tanstack/react-router";

import { AppPageLayout } from "@/shared/components/app-page-layout";
import LearningPlanFunnel from "@/features/learning-plan/components/learning-plan-funnel";
import { generateLearningPlan } from "@/features/learning-plan/api/learning-plan-service";

export const Route = createFileRoute("/app/create/")({
  component: CreateComponent,
});

function CreateComponent() {
  const navigate = Route.useNavigate();

  return (
    <AppPageLayout>
      <LearningPlanFunnel
        onSubmit={(apiData) => {
          generateLearningPlan(apiData).then(() => {
            navigate({ to: "/app" });
          });
        }}
      />
    </AppPageLayout>
  );
}

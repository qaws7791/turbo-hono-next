import { createFileRoute } from "@tanstack/react-router";

import { AppPageLayout } from "@/shared/components/app-page-layout";
import RoadmapFunnel from "@/features/roadmap/components/roadmap-funnel";
import { generateRoadmap } from "@/features/roadmap/api/roadmap-service";

export const Route = createFileRoute("/app/create/")({
  component: CreateComponent,
});

function CreateComponent() {
  const navigate = Route.useNavigate();

  return (
    <AppPageLayout>
      <RoadmapFunnel
        onSubmit={(apiData) => {
          generateRoadmap(apiData).then(() => {
            navigate({ to: "/app" });
          });
        }}
      />
    </AppPageLayout>
  );
}

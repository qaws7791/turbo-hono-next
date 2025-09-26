import { api } from "@/api/http-client";
import AppPageLayout from "@/components/app-page-layout";
import RoadmapFunnel from "@/domains/roadmap/components/roadmap-funnel";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/create/")({
  component: CreateComponent,
});

function CreateComponent() {
  const navigate = Route.useNavigate();

  return (
    <AppPageLayout>
      <RoadmapFunnel
        onSubmit={(apiData) => {
          api.ai.generateRoadmap(apiData).then(() => {
            navigate({ to: "/app" });
          });
        }}
      />
    </AppPageLayout>
  );
}

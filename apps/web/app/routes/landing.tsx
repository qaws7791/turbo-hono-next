import { useLoaderData } from "react-router";

import { LandingView } from "~/features/landing/landing-view";
import { useLandingModel } from "~/features/landing/use-landing-model";
import { getAuthStatus } from "~/api/compat/auth";

export function meta() {
  return [
    { title: "Learning OS" },
    {
      name: "description",
      content: "자료만 업로드하세요. 나머지는 AI가 합니다.",
    },
  ];
}

export async function clientLoader() {
  const { isAuthenticated } = await getAuthStatus();
  return { isAuthenticated };
}

export default function LandingRoute() {
  const { isAuthenticated } = useLoaderData<typeof clientLoader>();
  const model = useLandingModel({ isAuthenticated });
  return <LandingView model={model} />;
}

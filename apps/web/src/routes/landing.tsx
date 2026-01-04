import { useLoaderData } from "react-router";

import { getAuthSession } from "~/domains/auth";
import { LandingView, useLandingModel } from "~/domains/landing";

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
  const { isAuthenticated } = await getAuthSession();
  return { isAuthenticated };
}

export default function LandingRoute() {
  const { isAuthenticated } = useLoaderData<typeof clientLoader>();
  const model = useLandingModel({ isAuthenticated });
  return <LandingView model={model} />;
}

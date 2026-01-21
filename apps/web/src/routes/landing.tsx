import { LandingView } from "~/domains/landing";

export function meta() {
  return [
    { title: "Learning OS" },
    {
      name: "description",
      content: "자료만 업로드하세요. 나머지는 AI가 합니다.",
    },
  ];
}

export default function LandingRoute() {
  return <LandingView />;
}

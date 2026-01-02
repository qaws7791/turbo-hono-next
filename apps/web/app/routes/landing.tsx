import { useAuthMeQuery } from "~/modules/auth";
import { LandingView } from "~/modules/landing";

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
  const me = useAuthMeQuery();
  const isAuthenticated = Boolean(me.data);
  return <LandingView isAuthenticated={isAuthenticated} />;
}

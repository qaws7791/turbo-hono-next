import { useAuthMeQuery } from "~/modules/auth";
import { HomeView, useHomeQueueQuery } from "~/modules/home";

export function meta() {
  return [{ title: "Home" }];
}

export default function HomeRoute() {
  const me = useAuthMeQuery();
  const queue = useHomeQueueQuery();

  if (!me.data || !queue.data) {
    return null;
  }

  return (
    <HomeView
      user={me.data}
      queue={queue.data.data}
      summary={queue.data.summary}
    />
  );
}

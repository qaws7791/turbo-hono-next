import * as React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";

import type { SpaceDetail } from "~/modules/spaces";

import {
  SpaceLayoutView,
  useSpaceLayoutModel,
  useSpaceQuery,
} from "~/modules/spaces";

function tabToPath(spaceId: string, tab: string): string | null {
  if (tab === "documents") return `/spaces/${spaceId}/documents`;
  if (tab === "plans") return `/spaces/${spaceId}`;
  if (tab === "concepts") return `/spaces/${spaceId}/concepts`;
  return null;
}

export default function SpaceLayoutRoute() {
  const navigate = useNavigate();
  const { spaceId } = useParams();
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    if (!spaceId) return;
    const tab = searchParams.get("tab");
    if (!tab) return;
    const to = tabToPath(spaceId, tab);
    if (!to) return;
    navigate(to, { replace: true });
  }, [navigate, searchParams, spaceId]);

  if (!spaceId) {
    throw new Response("Not Found", { status: 404 });
  }

  return <SpaceLayoutRouteWithId spaceId={spaceId} />;
}

function SpaceLayoutRouteWithId({ spaceId }: { spaceId: string }) {
  const space = useSpaceQuery(spaceId);
  if (!space.data) {
    return null;
  }

  return <SpaceLayoutRouteLoaded space={space.data} />;
}

function SpaceLayoutRouteLoaded({ space }: { space: SpaceDetail }) {
  const model = useSpaceLayoutModel(space);

  return (
    <SpaceLayoutView
      space={space}
      model={model}
    />
  );
}

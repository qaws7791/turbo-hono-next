import { useLoaderData } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/space-overview";

import { getPlan, getPlanBySpaceActive, getSpace, listDocuments, listPlans, planNextQueue } from "~/mock/api";
import { SpaceOverviewView } from "~/features/spaces/overview/space-overview-view";
import { useSpaceOverviewModel } from "~/features/spaces/overview/use-space-overview-model";

const SpaceIdSchema = z.string().uuid();

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  const space = getSpace(spaceId.data);
  const documents = listDocuments(spaceId.data);
  const plans = listPlans(spaceId.data);
  const activePlan = getPlanBySpaceActive(spaceId.data);
  const nextQueue = activePlan ? planNextQueue(activePlan.id, 3) : [];

  const latestDocument = documents[0] ?? null;
  const latestPlan = plans[0] ?? null;

  return {
    space,
    documentCount: documents.length,
    planCount: plans.length,
    activePlan: activePlan ? getPlan(activePlan.id) : null,
    nextQueue,
    latestDocument,
    latestPlan,
  };
}

export default function SpaceOverviewRoute() {
  const data = useLoaderData<typeof clientLoader>();
  const model = useSpaceOverviewModel({
    nextQueue: data.nextQueue,
    activePlan: data.activePlan,
    latestDocument: data.latestDocument,
  });
  return <SpaceOverviewView data={data} model={model} />;
}

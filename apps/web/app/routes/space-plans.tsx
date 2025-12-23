import { redirect, useLoaderData } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/space-plans";

import { SpacePlansView } from "~/features/spaces/plans/space-plans-view";
import { useSpacePlansModel } from "~/features/spaces/plans/use-space-plans-model";
import {
  getPlan,
  getPlanBySpaceActive,
  getSpace,
  listPlans,
  planNextQueue,
  setActivePlan,
  setPlanStatus,
} from "~/mock/api";

const SpaceIdSchema = z.string().uuid();
const PlanIdSchema = z.string().uuid();
const IntentSchema = z.enum(["set-active", "pause", "resume", "archive"]);

export function meta() {
  return [{ title: "학습 계획" }];
}

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  const space = getSpace(spaceId.data);
  const plans = listPlans(spaceId.data);
  const activePlanData = getPlanBySpaceActive(spaceId.data);
  const activePlan = activePlanData ? getPlan(activePlanData.id) : null;
  const nextQueue = activePlan ? planNextQueue(activePlan.id, 3) : [];

  return { space, plans, activePlan, nextQueue };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = IntentSchema.safeParse(String(formData.get("intent") ?? ""));
  const planId = PlanIdSchema.safeParse(String(formData.get("planId") ?? ""));
  if (!intent.success || !planId.success) {
    throw new Response("Bad Request", { status: 400 });
  }

  if (intent.data === "set-active") {
    setActivePlan({ spaceId: spaceId.data, planId: planId.data });
    throw redirect(`/spaces/${spaceId.data}/plan/${planId.data}`);
  }

  if (intent.data === "pause") {
    setPlanStatus({ planId: planId.data, status: "paused" });
    return null;
  }

  if (intent.data === "resume") {
    setPlanStatus({ planId: planId.data, status: "active" });
    return null;
  }

  if (intent.data === "archive") {
    setPlanStatus({ planId: planId.data, status: "archived" });
    return null;
  }

  return null;
}

export default function SpacePlansRoute() {
  const { space, plans, activePlan, nextQueue } =
    useLoaderData<typeof clientLoader>();
  const model = useSpacePlansModel({ plans, nextQueue, activePlan });
  return (
    <SpacePlansView
      space={space}
      model={model}
    />
  );
}

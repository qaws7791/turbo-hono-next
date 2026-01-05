import { redirect, useLoaderData } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/space-plans";

import {
  activatePlan,
  listPlansForUi,
  updatePlanStatus,
} from "~/domains/plans";
import {
  SpacePlansView,
  getSpaceForUi,
  useSpacePlansModel,
} from "~/domains/spaces";
import { PublicIdSchema } from "~/foundation/lib";

const SpaceIdSchema = PublicIdSchema;
const PlanIdSchema = PublicIdSchema;
const IntentSchema = z.enum(["set-active", "pause", "resume", "archive"]);

export function meta() {
  return [{ title: "학습 계획" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  const space = await getSpaceForUi(spaceId.data);
  const plans = await listPlansForUi(spaceId.data);

  return { space, plans };
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
    await activatePlan(planId.data);
    throw redirect(`/spaces/${spaceId.data}/plan/${planId.data}`);
  }

  if (intent.data === "pause") {
    await updatePlanStatus(planId.data, "PAUSED");
    return null;
  }

  if (intent.data === "resume") {
    await updatePlanStatus(planId.data, "ACTIVE");
    return null;
  }

  if (intent.data === "archive") {
    await updatePlanStatus(planId.data, "ARCHIVED");
    return null;
  }

  return null;
}

export default function SpacePlansRoute() {
  const { space, plans } = useLoaderData<typeof clientLoader>();
  const model = useSpacePlansModel({ plans });
  return (
    <SpacePlansView
      space={space}
      model={model}
    />
  );
}

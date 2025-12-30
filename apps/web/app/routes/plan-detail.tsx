import { redirect, useLoaderData } from "react-router";
import { z } from "zod";

import type { PlanDetailData } from "~/features/plans/detail/types";
import type { Route } from "./+types/plan-detail";

import { PlanDetailView } from "~/features/plans/detail/plan-detail-view";
import { usePlanDetailModel } from "~/features/plans/detail/use-plan-detail-model";
import {
  getPlan,
  getSpace,
  listDocuments,
  planNextQueue,
  setPlanStatus,
} from "~/mock/api";
import { PublicIdSchema } from "~/mock/schemas";

const SpaceIdSchema = PublicIdSchema;
const PlanIdSchema = PublicIdSchema;
const IntentSchema = z.enum(["pause", "resume", "archive"]);

export function meta() {
  return [{ title: "학습 계획 상세" }];
}

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  const planId = PlanIdSchema.safeParse(params.planId);
  if (!spaceId.success || !planId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  const space = getSpace(spaceId.data);
  const plan = getPlan(planId.data);
  if (plan.spaceId !== spaceId.data) {
    throw new Response("Not Found", { status: 404 });
  }

  const allDocuments = listDocuments(spaceId.data);
  const sourceDocuments = allDocuments.filter((doc) =>
    plan.sourceDocumentIds.includes(doc.id),
  );

  return {
    space,
    plan,
    nextQueue: planNextQueue(plan.id, 3),
    sourceDocuments,
  };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const planId = PlanIdSchema.safeParse(params.planId);
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!planId.success || !spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = IntentSchema.safeParse(String(formData.get("intent") ?? ""));
  if (!intent.success) {
    throw new Response("Bad Request", { status: 400 });
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
    throw redirect(`/spaces/${spaceId.data}/plans`);
  }
  return null;
}

export default function PlanDetailRoute() {
  const data: PlanDetailData = useLoaderData<typeof clientLoader>();
  const model = usePlanDetailModel({
    plan: data.plan,
    nextQueue: data.nextQueue,
  });
  return (
    <PlanDetailView
      data={data}
      model={model}
    />
  );
}

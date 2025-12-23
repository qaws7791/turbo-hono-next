import { redirect, useFetcher, useLoaderData, useNavigate } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/plan-wizard";

import { PlanWizardView } from "~/features/plans/wizard/plan-wizard-view";
import { usePlanWizardModel } from "~/features/plans/wizard/use-plan-wizard-model";
import { createPlan, listDocuments } from "~/mock/api";
import { PlanGoalSchema, PlanLevelSchema, UuidSchema } from "~/mock/schemas";

const SpaceIdSchema = z.string().uuid();

export function meta() {
  return [{ title: "Plan 생성" }];
}

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  const documents = listDocuments(spaceId.data);
  return { spaceId: spaceId.data, documents };
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");
  if (intent !== "create-plan") {
    return null;
  }

  const ActionSchema = z.object({
    sourceDocumentIds: z.array(UuidSchema).min(1).max(5),
    goal: PlanGoalSchema,
    level: PlanLevelSchema,
    durationMode: z.enum(["custom", "adaptive"]),
    durationValue: z.coerce.number().int().positive().optional(),
    durationUnit: z.enum(["days", "weeks", "months"]).optional(),
    notes: z.string().max(500).optional(),
  });

  const parsed = ActionSchema.safeParse({
    sourceDocumentIds: formData
      .getAll("sourceDocumentIds")
      .map((v) => String(v)),
    goal: String(formData.get("goal") ?? ""),
    level: String(formData.get("level") ?? ""),
    durationMode: String(formData.get("durationMode") ?? ""),
    durationValue: formData.get("durationValue") ?? undefined,
    durationUnit: formData.get("durationUnit") ?? undefined,
    notes: (() => {
      const raw = String(formData.get("notes") ?? "").trim();
      return raw.length > 0 ? raw : undefined;
    })(),
  });

  if (!parsed.success) {
    throw new Response("Bad Request", { status: 400 });
  }

  const plan = createPlan({
    spaceId: spaceId.data,
    sourceDocumentIds: parsed.data.sourceDocumentIds,
    goal: parsed.data.goal,
    level: parsed.data.level,
    durationMode: parsed.data.durationMode,
    durationValue:
      parsed.data.durationMode === "custom" ? parsed.data.durationValue : undefined,
    durationUnit:
      parsed.data.durationMode === "custom" ? parsed.data.durationUnit : undefined,
    notes: parsed.data.notes,
  });

  throw redirect(`/spaces/${spaceId.data}/plan/${plan.id}`);
}

export default function PlanWizardRoute() {
  const { spaceId, documents } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";

  const model = usePlanWizardModel({
    documents,
    submitPlan: (formData) => {
      fetcher.submit(formData, { method: "post" });
    },
  });

  return (
    <PlanWizardView
      spaceId={spaceId}
      documents={documents}
      model={model}
      isSubmitting={isSubmitting}
      onCancel={() => navigate(`/spaces/${spaceId}/plans`)}
    />
  );
}


import { z } from "zod";

import { isPublicId } from "../../lib/public-id";

const PublicIdSchema = z.string().refine(isPublicId, "Invalid public id");

export const SpaceOutput = z.object({
  id: PublicIdSchema,
  name: z.string().min(1),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type SpaceOutput = z.infer<typeof SpaceOutput>;

export const ListSpacesResponse = z.object({
  data: z.array(SpaceOutput),
});
export type ListSpacesResponse = z.infer<typeof ListSpacesResponse>;

export const CreateSpaceInput = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
});
export type CreateSpaceInput = z.infer<typeof CreateSpaceInput>;

export const CreateSpaceResponse = z.object({
  data: SpaceOutput,
});
export type CreateSpaceResponse = z.infer<typeof CreateSpaceResponse>;

export const GetSpaceResponse = z.object({
  data: SpaceOutput,
});
export type GetSpaceResponse = z.infer<typeof GetSpaceResponse>;

export const UpdateSpaceInput = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(2000).optional(),
    icon: z.string().max(50).optional(),
    color: z.string().max(50).optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.description !== undefined ||
      value.icon !== undefined ||
      value.color !== undefined,
    "수정할 필드가 필요합니다.",
  );
export type UpdateSpaceInput = z.infer<typeof UpdateSpaceInput>;

export const UpdateSpaceResponse = z.object({
  data: SpaceOutput,
});
export type UpdateSpaceResponse = z.infer<typeof UpdateSpaceResponse>;

export const DeleteSpaceResponse = z.object({
  message: z.string().min(1),
});
export type DeleteSpaceResponse = z.infer<typeof DeleteSpaceResponse>;

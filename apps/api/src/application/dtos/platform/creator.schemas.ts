import { z } from "@hono/zod-openapi";

export const applyCreatorSchema = z.object({
  brandName: z.string().min(1, "브랜드 이름은 필수 입력 항목입니다."),
  introduction: z.string().min(1, "소개는 필수 입력 항목입니다."),
  businessNumber: z
    .string()
    .min(1, "사업자 등록번호는 필수 입력 항목입니다.")
    .regex(/^\d{3}-\d{2}-\d{5}$/, "사업자 등록번호 형식이 올바르지 않습니다."),
  businessName: z.string().min(1, "상호명은 필수 입력 항목입니다."),
  ownerName: z.string().min(1, "대표자명은 필수 입력 항목입니다."),
  sidoId: z.number().min(1, "시도는 필수 입력 항목입니다."),
  sigunguId: z.number().min(1, "시군구는 필수 입력 항목입니다."),
  contactInfo: z.string().min(1, "연락처는 필수 입력 항목입니다."),
  categoryId: z.number().min(1, "크리에이터 카테고리는 필수 입력 항목입니다."),
});

export const updateMyCreatorProfileSchema = z.object({
  brandName: z.string().optional(),
  introduction: z.string().optional(),
});

export const creatorProfileSchema = z.object({
  id: z.number(),
  brandName: z.string(),
  introduction: z.string(),
  businessNumber: z.string(),
  businessName: z.string(),
  ownerName: z.string(),
  sidoId: z.number(),
  sigunguId: z.number(),
  categoryId: z.number(),
  contactInfo: z.string(),
  applicationStatus: z.string(),
  approvedAt: z.string().datetime().nullable(),
  rejectedAt: z.string().datetime().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const publicCreatorProfileSchema = creatorProfileSchema.omit({
  businessNumber: true,
  businessName: true,
  ownerName: true,
  sidoId: true,
  sigunguId: true,
  categoryId: true,
  contactInfo: true,
});
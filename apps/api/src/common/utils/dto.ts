import { ErrorResponseDto, SuccessResponseDto } from "@/application/dtos/common.dto";
import { z } from "@hono/zod-openapi";
import { ZodTypeAny } from "zod";
export const createResponseDto = <T extends ZodTypeAny>(schema: T) => {
  return SuccessResponseDto.extend({
    data: schema,
  });
};

export const createPaginationResponseDto = <T extends ZodTypeAny>(schema: T) => {

  return SuccessResponseDto.extend({
    data: schema,
    pagination: z.object({
      totalPages: z.number(),
      totalItems: z.number(),
      currentPage: z.number(),
      itemsPerPage: z.number(),
      nextPage: z.number().nullable(),
      prevPage: z.number().nullable(),
    }),
  });
}

export const createCursorPaginationResponseDto = <T extends ZodTypeAny>(schema: T) => {
  return SuccessResponseDto.extend({
    data: schema,
    pagination: z.object({
      nextCursor: z.string().nullable(),
    })
  });
}

export const createErrorResponseDto = () => {
  return ErrorResponseDto
}
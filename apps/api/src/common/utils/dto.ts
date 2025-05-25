import { SuccessResponseDto } from "@/application/dtos/common.dto";
import { ZodTypeAny } from "zod";

export const createResponseDto = <T extends ZodTypeAny>(schema: T) => {
  return SuccessResponseDto.extend({
    data: schema,
  });
};

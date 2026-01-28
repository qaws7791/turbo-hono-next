import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";

export type MaterialReaderPort = {
  findByIds: (
    userId: string,
    materialIds: Array<string>,
  ) => ResultAsync<
    Array<{
      readonly id: string;
      readonly title: string;
      readonly summary: string | null;
      readonly mimeType: string | null;
    }>,
    AppError
  >;
};

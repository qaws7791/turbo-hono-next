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

  /**
   * Plan 생성(구조 설계)에서 사용하는 자료 메타정보 조회.
   * 입력 순서 보장을 위해 materialIds 순서대로 반환되어야 합니다.
   */
  findMaterialsMetaForPlan: (materialIds: ReadonlyArray<string>) => ResultAsync<
    ReadonlyArray<{
      readonly id: string;
      readonly title: string;
      readonly fileSize: number | null;
      readonly mimeType: string | null;
    }>,
    AppError
  >;

  /**
   * Plan 생성(구조 설계)에서 사용하는 outline 노드 조회.
   */
  findOutlineNodesForPlan: (materialIds: ReadonlyArray<string>) => ResultAsync<
    ReadonlyArray<{
      readonly materialId: string;
      readonly id: string;
      readonly parentId: string | null;
      readonly nodeType: string;
      readonly title: string;
      readonly summary: string | null;
      readonly orderIndex: number;
      readonly depth: number;
      readonly path: string;
      readonly keywords: Array<string> | null;
      readonly metadataJson: {
        readonly pageStart?: number;
        readonly pageEnd?: number;
        readonly lineStart?: number;
        readonly lineEnd?: number;
      } | null;
    }>,
    AppError
  >;
};

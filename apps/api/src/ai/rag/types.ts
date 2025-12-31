export type RagDocumentMetadata = {
  readonly userId: string;
  readonly spaceId: string;
  readonly materialId: string;
  readonly materialTitle: string;
  readonly originalFilename: string | null;
  readonly mimeType: string | null;
  readonly source: "material";
  readonly pageNumber?: number;
  readonly chunkIndex: number;
};

export type RagSearchResult = {
  readonly documentId: string;
  readonly content: string;
  readonly metadata: RagDocumentMetadata;
  readonly distance: number;
};

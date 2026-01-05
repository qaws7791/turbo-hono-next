export type MaterialStatus = "pending" | "analyzing" | "completed" | "error";

export type MaterialSource =
  | {
      type: "file";
      fileName: string;
      fileSizeBytes?: number;
    }
  | {
      type: "url";
      url: string;
    }
  | {
      type: "text";
      textPreview: string;
    };

export type MaterialKind = "file" | "url" | "text";

export type Material = {
  id: string;
  spaceId: string;
  title: string;
  kind: MaterialKind;
  status: MaterialStatus;
  summary?: string;
  tags: Array<string>;
  createdAt: string;
  updatedAt: string;
  analysisReadyAt?: string;
  source?: MaterialSource;
};

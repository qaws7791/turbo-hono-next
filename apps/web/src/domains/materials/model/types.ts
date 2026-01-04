export type DocumentStatus = "pending" | "analyzing" | "completed" | "error";

export type DocumentSource = {
  type: "file";
  fileName: string;
  fileSizeBytes?: number;
};

export type Document = {
  id: string;
  spaceId: string;
  title: string;
  kind: "text" | "file";
  status: DocumentStatus;
  summary?: string;
  tags: Array<string>;
  createdAt: string;
  updatedAt: string;
  analysisReadyAt?: string;
  source?: DocumentSource;
};

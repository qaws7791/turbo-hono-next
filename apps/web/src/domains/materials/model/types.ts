export type MaterialStatus = "pending" | "analyzing" | "completed" | "error";

export type MaterialSource = {
  type: "file";
  fileName: string;
  fileSizeBytes?: number;
};

export type Material = {
  id: string;
  spaceId: string;
  title: string;
  kind: "text" | "file";
  status: MaterialStatus;
  summary?: string;
  tags: Array<string>;
  createdAt: string;
  updatedAt: string;
  analysisReadyAt?: string;
  source?: MaterialSource;
};

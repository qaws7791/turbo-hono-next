import { useMutation } from "@tanstack/react-query";

import type { Document } from "@/features/roadmap/model/types";

import { uploadDocument as uploadDocumentRequest } from "@/features/roadmap/api/roadmap-service";

interface UploadResponse {
  success?: boolean;
  document?: Document;
}

export function useDocumentUpload() {
  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const response = await uploadDocumentRequest(file);
      return response.data as UploadResponse | null;
    },
  });

  const uploadDocument = async (file: File): Promise<Document> => {
    const payload = await mutation.mutateAsync(file);
    if (!payload?.success || !payload.document) {
      throw new Error("파일 업로드에 실패했습니다.");
    }

    return payload.document;
  };

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null;

  return {
    uploadDocument,
    isUploading: mutation.isPending,
    errorMessage,
  };
}

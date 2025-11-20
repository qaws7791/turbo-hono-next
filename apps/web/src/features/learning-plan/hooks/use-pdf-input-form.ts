import React from "react";

import { useDocumentUpload } from "./use-document-upload";

import type { Document } from "@/features/learning-plan/model/types";

import { getErrorMessage, logger } from "@/shared/utils";

const pdfInputLogger = logger.createScoped("PdfInputStep");

interface UsePdfInputFormReturn {
  document: Document | null;
  setDocument: (value: Document | null) => void;
  learningTopic: string;
  setLearningTopic: (value: string) => void;
  mainGoal: string;
  setMainGoal: (value: string) => void;
  error: string | null;
  setError: (value: string | null) => void;
  isUploading: boolean;
  isValid: boolean;
  handleUpload: (file: File) => Promise<void>;
  handleDelete: (documentId: string) => void;
  getFormData: () => {
    documentId: string;
    learningTopic: string;
    mainGoal: string;
  };
}

/**
 * PDF 입력 폼 상태를 관리하는 훅
 */
export const usePdfInputForm = (
  initialLearningTopic?: string,
  initialMainGoal?: string,
): UsePdfInputFormReturn => {
  const [document, setDocument] = React.useState<Document | null>(null);
  const [learningTopic, setLearningTopic] = React.useState<string>(
    initialLearningTopic || "",
  );
  const [mainGoal, setMainGoal] = React.useState<string>(initialMainGoal || "");
  const [error, setError] = React.useState<string | null>(null);
  const { uploadDocument, isUploading, errorMessage } = useDocumentUpload();

  React.useEffect(() => {
    if (!errorMessage) {
      return;
    }
    setError(errorMessage);
  }, [errorMessage]);

  const handleUpload = React.useCallback(
    async (file: File) => {
      setError(null);

      try {
        const uploadedDocument = await uploadDocument(file);
        setDocument(uploadedDocument);
      } catch (err) {
        const err_message = getErrorMessage(err, "파일 업로드에 실패했습니다.");
        setError(err_message);
        pdfInputLogger.error(
          "Document upload failed",
          err instanceof Error ? err : new Error(String(err)),
          { fileName: file.name, fileSize: file.size },
        );
      }
    },
    [uploadDocument],
  );

  const handleDelete = (documentId: string) => {
    pdfInputLogger.debug("Deleting document", { documentId });
    setDocument(null);
  };

  const isValid =
    document !== null &&
    learningTopic.trim().length > 0 &&
    mainGoal.trim().length > 0;

  const getFormData = React.useCallback(
    () => ({
      documentId: document!.id,
      learningTopic: learningTopic.trim(),
      mainGoal: mainGoal.trim(),
    }),
    [document, learningTopic, mainGoal],
  );

  return {
    document,
    setDocument,
    learningTopic,
    setLearningTopic,
    mainGoal,
    setMainGoal,
    error,
    setError,
    isUploading,
    isValid,
    handleUpload,
    handleDelete,
    getFormData,
  };
};

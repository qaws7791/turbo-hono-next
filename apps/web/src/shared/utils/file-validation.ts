/**
 * 파일 크기를 포맷된 문자열로 변환
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface FileValidationError {
  isValid: false;
  message: string;
}

interface FileValidationSuccess {
  isValid: true;
}

type FileValidationResult = FileValidationSuccess | FileValidationError;

/**
 * PDF 파일 유효성 검사
 */
export const validateFile = (
  file: File,
  maxSizeMB: number = 10,
): FileValidationResult => {
  // 파일 타입 확인
  if (file.type !== "application/pdf") {
    return {
      isValid: false,
      message: "PDF 파일만 업로드할 수 있습니다.",
    };
  }

  // 파일 크기 확인
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      message: `파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`,
    };
  }

  return {
    isValid: true,
  };
};

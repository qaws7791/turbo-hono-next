import { fileTypeFromBuffer } from "file-type";

/**
 * PDF 파일 검증
 * @param buffer - 파일 데이터
 * @returns 유효한 PDF인지 여부
 */
export async function validatePdfFile(buffer: Buffer): Promise<boolean> {
  try {
    const fileType = await fileTypeFromBuffer(buffer);

    // MIME 타입 확인
    if (fileType?.mime !== "application/pdf") {
      return false;
    }

    // PDF 매직 넘버 확인 (%PDF-)
    const header = buffer.slice(0, 5).toString("utf-8");
    if (!header.startsWith("%PDF-")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * 파일 크기 검증
 * @param size - 파일 크기 (bytes)
 * @param maxSize - 최대 크기 (기본 10MB)
 * @returns 유효한지 여부
 */
export function validateFileSize(
  size: number,
  maxSize: number = 10 * 1024 * 1024,
): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * 파일명 정제 (안전한 파일명으로 변환)
 * @param fileName - 원본 파일명
 * @returns 정제된 파일명
 */
export function sanitizeFileName(fileName: string): string {
  // 확장자 분리
  const parts = fileName.split(".");
  const ext = parts.pop();
  const name = parts.join(".");

  // 특수문자 제거 및 공백을 언더스코어로 변환
  const sanitized = name
    .replace(/[^\w가-힣\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 100); // 최대 100자

  return `${sanitized}.${ext}`;
}

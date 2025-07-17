import { BaseError } from "../../../shared/errors/base.error";

export class InvalidFileTypeError extends BaseError {
  constructor(mimeType: string) {
    super(`Invalid file type: ${mimeType}`, 400, "INVALID_FILE_TYPE");
  }
}

export class FileSizeExceededError extends BaseError {
  constructor(size: number, maxSize: number) {
    super(
      `File size ${size} bytes exceeds maximum allowed size ${maxSize} bytes`,
      400,
      "FILE_SIZE_EXCEEDED",
    );
  }
}

export class R2UploadError extends BaseError {
  constructor(message: string) {
    super(`R2 upload failed: ${message}`, 500, "R2_UPLOAD_ERROR");
  }
}

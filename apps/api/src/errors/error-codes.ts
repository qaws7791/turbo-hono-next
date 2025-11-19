/**
 * Standardized error codes for the API.
 * Format: <CATEGORY>_<SPECIFIC_ERROR>
 *
 * Categories:
 * - AUTH: Authentication and authorization errors
 * - VALIDATION: Request validation errors
 * - NOT_FOUND: Resource not found errors
 * - LEARNING_PLAN: Learning plan specific errors
 * - AI: AI generation errors
 * - DOCUMENT: Document upload/management errors
 * - INTERNAL: Internal server errors
 */
export const ErrorCodes = {
  // Authentication & Authorization (AUTH)
  AUTH_INVALID_CREDENTIALS: "AUTH_001",
  AUTH_SESSION_EXPIRED: "AUTH_002",
  AUTH_UNAUTHORIZED: "AUTH_003",
  AUTH_FORBIDDEN: "AUTH_004",
  AUTH_TOKEN_INVALID: "AUTH_005",
  AUTH_USER_NOT_FOUND: "AUTH_006",
  AUTH_EMAIL_ALREADY_EXISTS: "AUTH_007",
  AUTH_WEAK_PASSWORD: "AUTH_008",
  AUTH_SIGNUP_FAILED: "AUTH_009",
  AUTH_PASSWORD_CHANGE_FAILED: "AUTH_010",
  AUTH_SESSION_CREATE_FAILED: "AUTH_011",
  AUTH_SESSION_RETRIEVAL_FAILED: "AUTH_012",
  AUTH_SESSION_DELETE_FAILED: "AUTH_013",

  // Validation (VALIDATION)
  VALIDATION_INVALID_INPUT: "VAL_001",
  VALIDATION_MISSING_FIELD: "VAL_002",
  VALIDATION_INVALID_FORMAT: "VAL_003",
  VALIDATION_OUT_OF_RANGE: "VAL_004",
  VALIDATION_INVALID_PAGINATION: "VAL_005",

  // Not Found (NOT_FOUND)
  NOT_FOUND_RESOURCE: "NF_001",
  NOT_FOUND_USER: "NF_002",
  NOT_FOUND_LEARNING_PLAN: "NF_003",
  NOT_FOUND_LEARNING_MODULE: "NF_004",
  NOT_FOUND_LEARNING_TASK: "NF_005",
  NOT_FOUND_DOCUMENT: "NF_006",
  NOT_FOUND_CONVERSATION: "NF_007",

  // Learning Plan (LEARNING_PLAN)
  LEARNING_PLAN_CREATION_FAILED: "LP_001",
  LEARNING_PLAN_UPDATE_FAILED: "LP_002",
  LEARNING_PLAN_DELETE_FAILED: "LP_003",
  LEARNING_PLAN_ACCESS_DENIED: "LP_004",
  LEARNING_PLAN_INVALID_STATUS: "LP_005",
  LEARNING_PLAN_MODULE_CREATION_FAILED: "LP_006",
  LEARNING_PLAN_MODULE_REORDER_FAILED: "LP_007",
  LEARNING_PLAN_TASK_CREATION_FAILED: "LP_008",
  LEARNING_PLAN_TASK_MOVE_FAILED: "LP_009",
  LEARNING_PLAN_TASK_UPDATE_FAILED: "LP_010",
  LEARNING_PLAN_TASK_DELETION_FAILED: "LP_011",

  // AI (AI)
  AI_GENERATION_FAILED: "AI_001",
  AI_API_LIMIT_EXCEEDED: "AI_002",
  AI_API_UNAVAILABLE: "AI_003",
  AI_INVALID_PROMPT: "AI_004",
  AI_TIMEOUT: "AI_005",
  AI_NOTE_GENERATION_FAILED: "AI_006",
  AI_QUIZ_GENERATION_FAILED: "AI_007",

  // Document (DOCUMENT)
  DOCUMENT_UPLOAD_FAILED: "DOC_001",
  DOCUMENT_INVALID_TYPE: "DOC_002",
  DOCUMENT_TOO_LARGE: "DOC_003",
  DOCUMENT_DELETE_FAILED: "DOC_004",
  DOCUMENT_PARSE_FAILED: "DOC_005",
  DOCUMENT_STORAGE_ERROR: "DOC_006",

  // Internal (INTERNAL)
  INTERNAL_SERVER_ERROR: "INT_001",
  INTERNAL_DATABASE_ERROR: "INT_002",
  INTERNAL_TRANSACTION_FAILED: "INT_003",
  INTERNAL_EXTERNAL_SERVICE_ERROR: "INT_004",
  INTERNAL_CONFIGURATION_ERROR: "INT_005",
} as const;

/**
 * Type for error codes
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Error messages mapped to error codes
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // Auth
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: "Invalid email or password",
  [ErrorCodes.AUTH_SESSION_EXPIRED]:
    "Your session has expired. Please log in again",
  [ErrorCodes.AUTH_UNAUTHORIZED]: "Authentication required",
  [ErrorCodes.AUTH_FORBIDDEN]:
    "You don't have permission to access this resource",
  [ErrorCodes.AUTH_TOKEN_INVALID]: "Invalid authentication token",
  [ErrorCodes.AUTH_USER_NOT_FOUND]: "User not found",
  [ErrorCodes.AUTH_EMAIL_ALREADY_EXISTS]: "Email address already registered",
  [ErrorCodes.AUTH_WEAK_PASSWORD]:
    "Password does not meet security requirements",
  [ErrorCodes.AUTH_SIGNUP_FAILED]: "Failed to sign up user",
  [ErrorCodes.AUTH_PASSWORD_CHANGE_FAILED]: "Failed to change password",
  [ErrorCodes.AUTH_SESSION_CREATE_FAILED]: "Failed to create session",
  [ErrorCodes.AUTH_SESSION_RETRIEVAL_FAILED]: "Failed to retrieve session",
  [ErrorCodes.AUTH_SESSION_DELETE_FAILED]: "Failed to delete session",

  // Validation
  [ErrorCodes.VALIDATION_INVALID_INPUT]: "Invalid request data",
  [ErrorCodes.VALIDATION_MISSING_FIELD]: "Required field is missing",
  [ErrorCodes.VALIDATION_INVALID_FORMAT]: "Invalid data format",
  [ErrorCodes.VALIDATION_OUT_OF_RANGE]: "Value is out of acceptable range",
  [ErrorCodes.VALIDATION_INVALID_PAGINATION]: "Invalid pagination parameters",

  // Not Found
  [ErrorCodes.NOT_FOUND_RESOURCE]: "Requested resource not found",
  [ErrorCodes.NOT_FOUND_USER]: "User not found",
  [ErrorCodes.NOT_FOUND_LEARNING_PLAN]: "Learning plan not found",
  [ErrorCodes.NOT_FOUND_LEARNING_MODULE]: "Learning module not found",
  [ErrorCodes.NOT_FOUND_LEARNING_TASK]: "Learning task not found",
  [ErrorCodes.NOT_FOUND_DOCUMENT]: "Document not found",
  [ErrorCodes.NOT_FOUND_CONVERSATION]: "Conversation not found",

  // Learning Plan
  [ErrorCodes.LEARNING_PLAN_CREATION_FAILED]: "Failed to create learning plan",
  [ErrorCodes.LEARNING_PLAN_UPDATE_FAILED]: "Failed to update learning plan",
  [ErrorCodes.LEARNING_PLAN_DELETE_FAILED]: "Failed to delete learning plan",
  [ErrorCodes.LEARNING_PLAN_ACCESS_DENIED]: "Access denied to learning plan",
  [ErrorCodes.LEARNING_PLAN_INVALID_STATUS]: "Invalid learning plan status",
  [ErrorCodes.LEARNING_PLAN_MODULE_CREATION_FAILED]:
    "Failed to create learning module",
  [ErrorCodes.LEARNING_PLAN_MODULE_REORDER_FAILED]:
    "Failed to reorder learning module",
  [ErrorCodes.LEARNING_PLAN_TASK_CREATION_FAILED]:
    "Failed to create learning task",
  [ErrorCodes.LEARNING_PLAN_TASK_MOVE_FAILED]: "Failed to move learning task",
  [ErrorCodes.LEARNING_PLAN_TASK_UPDATE_FAILED]:
    "Failed to update learning task",
  [ErrorCodes.LEARNING_PLAN_TASK_DELETION_FAILED]:
    "Failed to delete learning task",

  // AI
  [ErrorCodes.AI_GENERATION_FAILED]: "AI generation failed",
  [ErrorCodes.AI_API_LIMIT_EXCEEDED]: "AI API rate limit exceeded",
  [ErrorCodes.AI_API_UNAVAILABLE]: "AI service is temporarily unavailable",
  [ErrorCodes.AI_INVALID_PROMPT]: "Invalid AI prompt",
  [ErrorCodes.AI_TIMEOUT]: "AI generation timed out",
  [ErrorCodes.AI_NOTE_GENERATION_FAILED]: "Failed to generate AI note",
  [ErrorCodes.AI_QUIZ_GENERATION_FAILED]: "Failed to generate AI quiz",

  // Document
  [ErrorCodes.DOCUMENT_UPLOAD_FAILED]: "Failed to upload document",
  [ErrorCodes.DOCUMENT_INVALID_TYPE]: "Invalid document type",
  [ErrorCodes.DOCUMENT_TOO_LARGE]: "Document size exceeds limit",
  [ErrorCodes.DOCUMENT_DELETE_FAILED]: "Failed to delete document",
  [ErrorCodes.DOCUMENT_PARSE_FAILED]: "Failed to parse document",
  [ErrorCodes.DOCUMENT_STORAGE_ERROR]: "Document storage error",

  // Internal
  [ErrorCodes.INTERNAL_SERVER_ERROR]: "An unexpected error occurred",
  [ErrorCodes.INTERNAL_DATABASE_ERROR]: "Database error occurred",
  [ErrorCodes.INTERNAL_TRANSACTION_FAILED]: "Transaction failed",
  [ErrorCodes.INTERNAL_EXTERNAL_SERVICE_ERROR]: "External service error",
  [ErrorCodes.INTERNAL_CONFIGURATION_ERROR]: "Configuration error",
};

/**
 * Get error message by code
 */
export function getErrorMessage(code: ErrorCode): string {
  return ErrorMessages[code] || ErrorMessages[ErrorCodes.INTERNAL_SERVER_ERROR];
}

/**
 * Type definitions for AI Chat module
 */

/**
 * Stored tool invocation that combines call and result information
 * This is a custom format for database storage, not the SDK's runtime format
 */
export interface StoredToolInvocation {
  /** Unique identifier for the tool call */
  toolCallId: string;
  /** Name of the tool that was called */
  toolName: string;
  /** Arguments passed to the tool */
  arguments: Record<string, unknown>;
  /** Result returned by the tool (if executed) */
  result?: unknown;
  /** Whether the tool was executed by the provider */
  providerExecuted?: boolean;
  /** Error information if the tool call failed */
  error?: unknown;
}

import * as React from "react";

import { createOrResumeSessionRun } from "../api";

export function useCreateOrResumeSessionRunMutation(): {
  isSubmitting: boolean;
  createOrResumeSessionRun: (sessionId: string) => Promise<{
    runId: string;
    isRecovery: boolean;
  }>;
} {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const createOrResume = React.useCallback(async (sessionId: string) => {
    setIsSubmitting(true);
    try {
      return await createOrResumeSessionRun(sessionId);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, createOrResumeSessionRun: createOrResume };
}

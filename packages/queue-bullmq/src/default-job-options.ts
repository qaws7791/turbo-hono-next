import type { DefaultJobOptions } from "bullmq";

export const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
  removeOnComplete: {
    age: 3600,
    count: 100,
  },
  removeOnFail: {
    age: 86400,
  },
};

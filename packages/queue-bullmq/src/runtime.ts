export type ClosableResource = {
  readonly close: () => Promise<void>;
};

export type QueueRuntime = {
  readonly resources: ReadonlyArray<ClosableResource>;
  readonly register: (resource: ClosableResource) => void;
  readonly shutdown: () => Promise<void>;
};

export function createQueueRuntime(): QueueRuntime {
  const resources: Array<ClosableResource> = [];

  return {
    resources,
    register: (resource) => {
      resources.push(resource);
    },
    shutdown: async () => {
      await Promise.all(resources.map((r) => r.close()));
    },
  };
}

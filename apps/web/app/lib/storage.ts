import type { z } from "zod";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const memoryStorage = (() => {
  const map = new Map<string, string>();
  const storage: StorageLike = {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
  return storage;
})();

function getStorage(): StorageLike {
  if (typeof window === "undefined") {
    return memoryStorage;
  }
  try {
    return window.localStorage;
  } catch {
    return memoryStorage;
  }
}

export function readJsonFromStorage<TSchema extends z.ZodTypeAny>(
  key: string,
  schema: TSchema,
): z.infer<TSchema> | null {
  const storage = getStorage();
  const raw = storage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    const result = schema.safeParse(parsed);
    if (!result.success) {
      return null;
    }
    return result.data;
  } catch {
    return null;
  }
}

export function writeJsonToStorage<TSchema extends z.ZodTypeAny>(
  key: string,
  schema: TSchema,
  value: z.infer<TSchema>,
): void {
  const storage = getStorage();
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new Error(`Refusing to write invalid value to storage: ${key}`);
  }
  storage.setItem(key, JSON.stringify(parsed.data));
}

export function removeFromStorage(key: string): void {
  const storage = getStorage();
  storage.removeItem(key);
}


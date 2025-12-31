import { rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

type WithTempFileParams = {
  readonly bytes: Uint8Array;
  readonly extension: string;
};

export async function withTempFile<T>(
  params: WithTempFileParams,
  fn: (filePath: string) => Promise<T>,
): Promise<T> {
  const ext = params.extension.startsWith(".")
    ? params.extension
    : `.${params.extension}`;
  const filePath = join(tmpdir(), `lolog-${crypto.randomUUID()}${ext}`);

  await writeFile(filePath, params.bytes);
  try {
    return await fn(filePath);
  } finally {
    await rm(filePath, { force: true });
  }
}

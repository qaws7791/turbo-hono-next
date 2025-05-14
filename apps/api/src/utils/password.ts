import { env } from "@/config/env";
import { hash, verify } from "@node-rs/argon2";

const MEMORY_COST_KB = 47104;
const TIME_COST = 2;
const PARALLELISM = 1;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: MEMORY_COST_KB,
    timeCost: TIME_COST,
    parallelism: PARALLELISM,
    secret: new TextEncoder().encode(env.PASSWORD_HASH_SECRET),
  });
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    return verify(hashedPassword, password, {
      memoryCost: MEMORY_COST_KB,
      timeCost: TIME_COST,
      parallelism: PARALLELISM,
      secret: new TextEncoder().encode(env.PASSWORD_HASH_SECRET),
    });
  } catch (error) {
    return false;
  }
}

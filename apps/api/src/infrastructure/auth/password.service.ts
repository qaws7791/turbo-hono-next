import { env } from "@/common/config/env";
import { hash, verify } from "@node-rs/argon2";
import { injectable } from "inversify";

@injectable()
export class PasswordService {
  private readonly MEMORY_COST_KB = 47104;
  private readonly TIME_COST = 2;
  private readonly PARALLELISM = 1;
  private readonly SECRET = new TextEncoder().encode(env.PASSWORD_HASH_SECRET);

  async hashPassword(password: string): Promise<string> {
    return hash(password, {
      memoryCost: this.MEMORY_COST_KB,
      timeCost: this.TIME_COST,
      parallelism: this.PARALLELISM,
      secret: this.SECRET,
    });
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return verify(hashedPassword, password, {
        memoryCost: this.MEMORY_COST_KB,
        timeCost: this.TIME_COST,
        parallelism: this.PARALLELISM,
        secret: this.SECRET,
      });
    } catch (error) {
      return false;
    }
  }
}

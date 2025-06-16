import { env } from "@/common/config/env";
import { IPasswordService } from "@/infrastructure/auth/password.service.interface";
import * as argon2 from "argon2";
import { injectable } from "inversify";

@injectable()
export class Argon2PasswordService implements IPasswordService {
  private readonly MEMORY_COST_KB = 47104;
  private readonly TIME_COST = 2;
  private readonly PARALLELISM = 1;
  private readonly SECRET = Buffer.from(env.PASSWORD_HASH_SECRET);

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
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
      return argon2.verify(hashedPassword, password, {
        secret: this.SECRET,
      });
    } catch {
      return false;
    }
  }
}

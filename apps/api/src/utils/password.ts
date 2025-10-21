import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const passwordUtils = {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  },

  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  },
};

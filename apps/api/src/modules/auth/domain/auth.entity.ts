import type { MagicLink, Session } from "./auth.types";

export class SessionEntity implements Session {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly token: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
  ) {}

  static create(
    userId: number,
    durationInHours: number = 24 * 7,
  ): Omit<Session, "id" | "token" | "createdAt"> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationInHours);

    return {
      userId,
      expiresAt,
    };
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isExpired();
  }

  getRemainingTime(): number {
    return Math.max(0, this.expiresAt.getTime() - Date.now());
  }
}

export class MagicLinkEntity implements MagicLink {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly token: string,
    public readonly type: "signup" | "signin",
    public readonly isUsed: boolean,
    public readonly usedAt: Date | null,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
  ) {}

  static create(
    email: string,
    type: "signup" | "signin",
    expiryMinutes: number = 10,
  ): Omit<MagicLink, "id" | "token" | "isUsed" | "usedAt" | "createdAt"> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

    return {
      email,
      type,
      expiresAt,
    };
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isUsed;
  }

  canBeUsed(): boolean {
    return this.isValid();
  }

  getRemainingTime(): number {
    return Math.max(0, this.expiresAt.getTime() - Date.now());
  }
}

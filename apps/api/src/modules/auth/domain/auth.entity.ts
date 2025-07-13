import type { MagicLink, Session, User } from "./auth.types";

export class UserEntity implements User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly username: string,
    public readonly displayName: string,
    public readonly profileImage: string,
    public readonly bio: string,
    public readonly role: "user" | "creator",
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: {
    email: string;
    username: string;
    displayName: string;
    profileImage?: string;
    bio?: string;
    role?: "user" | "creator";
  }): Omit<User, "id" | "createdAt" | "updatedAt"> {
    return {
      email: data.email,
      username: data.username,
      displayName: data.displayName,
      profileImage:
        data.profileImage ||
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
      bio: data.bio || "",
      role: data.role || "user",
    };
  }

  isCreator(): boolean {
    return this.role === "creator";
  }

  canAccess(requiredRole: "user" | "creator"): boolean {
    if (requiredRole === "user") return true;
    return this.role === "creator";
  }

  toPublic(): Omit<User, "email"> {
    return {
      id: this.id,
      username: this.username,
      displayName: this.displayName,
      profileImage: this.profileImage,
      bio: this.bio,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

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

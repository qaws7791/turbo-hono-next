export interface User {
  id: number;
  email: string;
  username: string;
  displayName: string;
  profileImage: string;
  bio: string;
  role: "user" | "creator" | "admin";
  createdAt: Date;
  updatedAt: Date;
  creator: CreatorInfo | null;
}

export class UserEntity implements User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly username: string,
    public readonly displayName: string,
    public readonly profileImage: string,
    public readonly bio: string,
    public readonly role: "user" | "creator" | "admin",
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly creator: CreatorInfo | null,
  ) {}

  static create(data: {
    email: string;
    username: string;
    displayName: string;
    profileImage?: string;
    bio?: string;
    role?: "user" | "creator" | "admin";
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
      creator: null,
    };
  }

  isCreator(): boolean {
    return this.role === "creator";
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }

  canAccess(requiredRole: "user" | "creator" | "admin"): boolean {
    if (requiredRole === "user") return true;
    if (this.role === "creator" && requiredRole === "creator") return true;
    if (this.role === "admin" && requiredRole === "admin") return true;
    return false;
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
      creator: this.creator,
    };
  }
}

export interface CreatorInfo {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  brandName: string;
  region: string;
  address: string | null;
  category:
    | "art"
    | "craft"
    | "music"
    | "photo"
    | "writing"
    | "design"
    | "tech"
    | "cooking"
    | "other";
  socialLinks: Record<string, string> | null;
  description: string;
}

export class CreatorEntity implements CreatorInfo {
  constructor(
    public readonly id: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly userId: number,
    public readonly brandName: string,
    public readonly region: string,
    public readonly address: string | null,
    public readonly category:
      | "art"
      | "craft"
      | "music"
      | "photo"
      | "writing"
      | "design"
      | "tech"
      | "cooking"
      | "other",
    public readonly socialLinks: Record<string, string> | null,
    public readonly description: string,
  ) {}

  static create(data: {
    userId: number;
    brandName: string;
    region: string;
    address?: string | null;
    category:
      | "art"
      | "craft"
      | "music"
      | "photo"
      | "writing"
      | "design"
      | "tech"
      | "cooking"
      | "other";
    socialLinks?: Record<string, string> | null;
    description: string;
  }): Omit<CreatorInfo, "id" | "createdAt" | "updatedAt"> {
    return {
      userId: data.userId,
      brandName: data.brandName,
      region: data.region,
      address: data.address || null,
      category: data.category,
      socialLinks: data.socialLinks || null,
      description: data.description,
    };
  }
}

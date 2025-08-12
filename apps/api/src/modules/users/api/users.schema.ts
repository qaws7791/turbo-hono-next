import { z } from "@hono/zod-openapi";

export const UserProfileSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  username: z.string(),
  displayName: z.string(),
  profileImage: z.string().url(),
  bio: z.string(),
  role: z.enum(["user", "creator", "admin"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  creator: z
    .object({
      description: z.string(),
      brandName: z.string(),
      region: z.string(),
      address: z.string().nullable(),
      category: z.string(),
      socialLinks: z.record(z.string(), z.string()).nullable(),
    })
    .nullable(),
  stats: z.object({
    followingCount: z.number().int().positive(),
    followersCount: z.number().int().positive(),
    projectsCount: z.number().int().positive(),
    storiesCount: z.number().int().positive(),
  }),
});

export const UserIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const UpdateUserRequestSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  displayName: z.string().min(1).max(50).optional(),
  profileImage: z.string().url().optional(),
  bio: z.string().max(200).optional(),
});
export const BecomeCreatorRequestSchema = z.object({
  brandName: z.string().min(1).max(50),
  region: z.string().min(1).max(50),
  address: z.string().min(1).max(200).nullable(),
  category: z.enum([
    "art",
    "craft",
    "music",
    "photo",
    "writing",
    "design",
    "tech",
    "cooking",
    "other",
  ]),
  socialLinks: z.record(z.string(), z.string()).optional().nullable(),
  description: z.string().min(1).max(200).optional(),
});

export const PublicUserProfileSchema = z.object({
  id: z.number().int().positive(),
  username: z.string(),
  displayName: z.string(),
  profileImage: z.string().url().nullable(),
  bio: z.string(),
  role: z.enum(["user", "creator"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  creator: z
    .object({
      description: z.string(),
      brandName: z.string(),
      region: z.string(),
      address: z.string().nullable(),
      category: z.string(),
      socialLinks: z.record(z.string(), z.string()).nullable(),
    })
    .nullable(),
  stats: z.object({
    followersCount: z.number().int().positive(),
    projectsCount: z.number().int().positive(),
    storiesCount: z.number().int().positive(),
  }),
  isFollowing: z.boolean().optional(),
});

export const FollowSchema = z.object({
  followerId: z.number().int().positive(),
  followingId: z.number().int().positive(),
});

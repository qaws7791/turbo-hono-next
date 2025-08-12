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
}

export interface Session {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface MagicLink {
  id: number;
  email: string;
  token: string;
  type: "signup" | "signin";
  isUsed: boolean;
  usedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
}

// Request/Response DTOs
export interface EmailSignupRequest {
  email: string;
}

export interface EmailSigninRequest {
  email: string;
}

export interface KakaoSigninRequest {
  code: string;
  redirectUri?: string;
}

export interface EmailVerifyRequest {
  token: string;
}

export interface EmailSentResponse {
  message: string;
  email: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  session: Session;
}

// Kakao OAuth Response Types
export interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
}

export interface KakaoUserInfo {
  id: number;
  connected_at: string;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    profile_nickname_needs_agreement?: boolean;
    profile_image_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
      is_default_image?: boolean;
    };
    has_email?: boolean;
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    email?: string;
  };
}

// Middleware Context
export interface AuthContext {
  userId: number;
  userRole: "user" | "creator" | "admin";
  sessionId: string;
}

import { account, user } from "@repo/database/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { authConfig } from "../../../config/auth";
import { db } from "../../../database/client";
import { log } from "../../../lib/logger";
import { passwordUtils } from "../../../utils/password";
import { AuthError, AuthErrors } from "../errors";

import { sessionService } from "./session.service";

/**
 * Input type for user signup
 */
export interface SignupInput {
  email: string;
  password: string;
  name?: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Input type for email login
 */
export interface LoginWithEmailInput {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Input type for changing password
 */
export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

/**
 * Response type for auth operations that create sessions
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image: string | null;
  };
  session: {
    id: string;
    expiresAt: string;
  };
}

/**
 * Service layer for authentication operations.
 * Handles user signup, login, password management.
 */
export class AuthService {
  /**
   * Creates a new user account with email and password
   * @param input - Signup data
   * @returns User and session information
   */
  async signup(input: SignupInput): Promise<AuthResponse> {
    try {
      const { email, password, name: rawName, userAgent, ipAddress } = input;

      // Check if user already exists
      const existingUsers = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (existingUsers.length > 0) {
        throw AuthErrors.emailExists();
      }

      // Normalize name: use provided name, fallback to email local part
      const normalizedName = rawName ? rawName.trim() : "";
      const [localPart = email] = email.split("@");
      const displayName: string =
        normalizedName.length > 0 ? normalizedName : localPart;

      // Hash password
      const hashedPassword = await passwordUtils.hash(password);

      // Create user, account, and session in a transaction
      const result = await db.transaction(async (tx) => {
        const userId = nanoid();
        const now = new Date();

        // Create user
        const newUser: typeof user.$inferInsert = {
          id: userId,
          email,
          name: displayName,
          createdAt: now,
          updatedAt: now,
        };

        await tx.insert(user).values(newUser);

        // Create account with password
        const accountId = nanoid();
        const newAccount: typeof account.$inferInsert = {
          id: accountId,
          accountId: email,
          providerId: "email",
          userId,
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        };

        await tx.insert(account).values(newAccount);

        return {
          userId,
          email,
          displayName,
        };
      });

      // Create session (outside transaction as it's a separate operation)
      const sessionToken = await sessionService.createSession({
        userId: result.userId,
        userAgent,
        ipAddress,
      });

      log.auth("User signup successful", {
        userId: result.userId,
        email: result.email,
      });

      return {
        user: {
          id: result.userId,
          email: result.email,
          name: result.displayName,
          emailVerified: false,
          image: null,
        },
        session: {
          id: sessionToken,
          expiresAt: new Date(
            Date.now() + authConfig.session.expiresIn * 1000,
          ).toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      log.error("User signup failed", error, {
        email: input.email,
      });

      throw AuthErrors.signupFailed();
    }
  }

  /**
   * Authenticates a user with email and password
   * @param input - Login credentials
   * @returns User and session information
   */
  async loginWithEmail(input: LoginWithEmailInput): Promise<AuthResponse> {
    try {
      const { email, password, userAgent, ipAddress } = input;

      // Find user and their email/password account
      const result = await db
        .select({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            image: user.image,
          },
          account: {
            password: account.password,
          },
        })
        .from(user)
        .innerJoin(account, eq(account.userId, user.id))
        .where(and(eq(user.email, email), eq(account.providerId, "email")))
        .limit(1);

      const [loginRow] = result;

      if (!loginRow) {
        throw AuthErrors.invalidCredentials();
      }

      const accountPassword = loginRow.account.password;

      if (!accountPassword) {
        throw AuthErrors.invalidCredentials();
      }

      const foundUser = loginRow.user;

      // Verify password
      const isValidPassword = await passwordUtils.verify(
        password,
        accountPassword,
      );
      if (!isValidPassword) {
        throw AuthErrors.invalidCredentials();
      }

      // Create session
      const sessionToken = await sessionService.createSession({
        userId: foundUser.id,
        userAgent,
        ipAddress,
      });

      log.auth("User login successful", {
        userId: foundUser.id,
        email: foundUser.email,
      });

      return {
        user: {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          emailVerified: Boolean(foundUser.emailVerified),
          image: foundUser.image,
        },
        session: {
          id: sessionToken,
          expiresAt: new Date(
            Date.now() + authConfig.session.expiresIn * 1000,
          ).toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      log.error("User login failed", error, {
        email: input.email,
      });

      throw AuthErrors.invalidCredentials();
    }
  }

  /**
   * Changes a user's password
   * @param input - Password change data
   * @returns Success response
   */
  async changePassword(
    input: ChangePasswordInput,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { userId, currentPassword, newPassword } = input;

      // Get user's account
      const userAccount = await db
        .select()
        .from(account)
        .where(eq(account.userId, userId))
        .limit(1);

      const [accountRow] = userAccount;

      if (!accountRow?.password) {
        throw AuthErrors.invalidCredentials({
          message: "User account not found or no password set",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await passwordUtils.verify(
        currentPassword,
        accountRow.password,
      );
      if (!isCurrentPasswordValid) {
        throw AuthErrors.invalidCredentials({
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const hashedNewPassword = await passwordUtils.hash(newPassword);

      // Update password
      await db
        .update(account)
        .set({
          password: hashedNewPassword,
          updatedAt: new Date(),
        })
        .where(eq(account.userId, userId));

      log.auth("Password changed successfully", { userId });

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      log.error("Password change failed", error, {
        userId: input.userId,
      });

      throw AuthErrors.passwordChangeFailed();
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

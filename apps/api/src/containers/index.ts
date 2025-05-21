import { AuthService } from "@/application/platform/auth.service";
import { ObjectService } from "@/application/platform/object.service";
import { ReactionService } from "@/application/platform/reaction.service";
import { StoryService } from "@/application/platform/story.service";
import { UserService } from "@/application/platform/user.service";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import { PasswordService } from "@/infrastructure/auth/password.service";
import { initializeDatabase } from "@/infrastructure/database";
import { AccountRepository } from "@/infrastructure/database/repositories/account.repository";
import { EmailVerificationTokenRepository } from "@/infrastructure/database/repositories/email-verification-token.repository";
import { ObjectRepository } from "@/infrastructure/database/repositories/object.repository";
import { ReactionRepository } from "@/infrastructure/database/repositories/reaction.repository";
import { SessionRepository } from "@/infrastructure/database/repositories/session.repository";
import { StoryRepository } from "@/infrastructure/database/repositories/story.repository";
import { UserRepository } from "@/infrastructure/database/repositories/user.repository";
import { type DbClient } from "@/infrastructure/database/types";
import { ResendService } from "@/infrastructure/email/resend.service";
import { KakaoOAuthService } from "@/infrastructure/oauth/kakao-oauth.service";
import { R2Service } from "@/infrastructure/storage/r2.service";
import { Container } from "inversify";

export const container = new Container();
const db = initializeDatabase();

// DB
container.bind<DbClient>(DI_SYMBOLS.db).toDynamicValue(() => db);

// Repositories
container
  .bind<EmailVerificationTokenRepository>(
    DI_SYMBOLS.emailVerificationTokenRepository,
  )
  .to(EmailVerificationTokenRepository);
container.bind<UserRepository>(DI_SYMBOLS.userRepository).to(UserRepository);
container
  .bind<AccountRepository>(DI_SYMBOLS.accountRepository)
  .to(AccountRepository);
container
  .bind<SessionRepository>(DI_SYMBOLS.sessionRepository)
  .to(SessionRepository);
container
  .bind<ObjectRepository>(DI_SYMBOLS.objectRepository)
  .to(ObjectRepository);
container.bind<StoryRepository>(DI_SYMBOLS.storyRepository).to(StoryRepository);
container
  .bind<ReactionRepository>(DI_SYMBOLS.reactionRepository)
  .to(ReactionRepository);

// Services
container.bind<AuthService>(DI_SYMBOLS.authService).to(AuthService);
container.bind<ObjectService>(DI_SYMBOLS.objectService).to(ObjectService);
container.bind<R2Service>(DI_SYMBOLS.r2Service).to(R2Service);
container.bind<StoryService>(DI_SYMBOLS.storyService).to(StoryService);
container.bind<ReactionService>(DI_SYMBOLS.reactionService).to(ReactionService);
container.bind<UserService>(DI_SYMBOLS.userService).to(UserService);
container.bind<ResendService>(DI_SYMBOLS.resendService).to(ResendService);
container.bind<PasswordService>(DI_SYMBOLS.passwordService).to(PasswordService);
container
  .bind<KakaoOAuthService>(DI_SYMBOLS.kakaoOAuthService)
  .to(KakaoOAuthService);

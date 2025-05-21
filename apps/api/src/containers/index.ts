import { DI_SYMBOLS } from "@/containers/symbols";
import { initializeDatabase } from "@/db";
import { AccountRepository } from "@/db/repositories/account.repository";
import { EmailVerificationTokenRepository } from "@/db/repositories/email-verification-token.repository";
import { ObjectRepository } from "@/db/repositories/object.repository";
import { ReactionRepository } from "@/db/repositories/reaction.repository";
import { SessionRepository } from "@/db/repositories/session.repository";
import { StoryRepository } from "@/db/repositories/story.repository";
import { UserRepository } from "@/db/repositories/user.repository";
import { type DbClient } from "@/db/types";
import { AuthService } from "@/services/auth.service";
import { ObjectService } from "@/services/object.service";
import { R2Service } from "@/services/r2.service";
import { ReactionService } from "@/services/reaction.service";
import { StoryService } from "@/services/story.service";
import { UserService } from "@/services/user.service";
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

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
import { Container } from "inversify";
export const container = new Container();
const db = initializeDatabase();

// DB
container.bind<DbClient>("db").toDynamicValue(() => db);

// Repositories
container
  .bind<EmailVerificationTokenRepository>("emailVerificationTokenRepository")
  .to(EmailVerificationTokenRepository);
container.bind<UserRepository>("userRepository").to(UserRepository);
container.bind<AccountRepository>("accountRepository").to(AccountRepository);
container.bind<SessionRepository>("sessionRepository").to(SessionRepository);
container.bind<ObjectRepository>("objectRepository").to(ObjectRepository);
container.bind<StoryRepository>("storyRepository").to(StoryRepository);
container.bind<ReactionRepository>("reactionRepository").to(ReactionRepository);

// Services
container.bind<AuthService>("authService").to(AuthService);
container.bind<ObjectService>("objectService").to(ObjectService);
container.bind<R2Service>("r2Service").to(R2Service);
container.bind<StoryService>("storyService").to(StoryService);
container.bind<ReactionService>("reactionService").to(ReactionService);

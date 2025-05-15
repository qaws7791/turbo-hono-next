import { initializeDatabase } from "@/db";
import { AccountRepository } from "@/db/repositories/account.repository";
import { EmailVerificationTokenRepository } from "@/db/repositories/email-verification-token.repository";
import { ObjectRepository } from "@/db/repositories/object.repository";
import { SessionRepository } from "@/db/repositories/session.repository";
import { UserRepository } from "@/db/repositories/user.repository";
import { type DbClient } from "@/db/types";
import { AuthService } from "@/services/auth.service";
import { ObjectService } from "@/services/object.service";
import { R2Service } from "@/services/r2.service";
import { Container } from "inversify";
export const container = new Container();
const db = initializeDatabase();

container.bind<DbClient>("db").toDynamicValue(() => db);

container
  .bind<EmailVerificationTokenRepository>("emailVerificationTokenRepository")
  .to(EmailVerificationTokenRepository);
container.bind<UserRepository>("userRepository").to(UserRepository);
container.bind<AccountRepository>("accountRepository").to(AccountRepository);
container.bind<SessionRepository>("sessionRepository").to(SessionRepository);
container.bind<ObjectRepository>("objectRepository").to(ObjectRepository);
container.bind<AuthService>("authService").to(AuthService);
container.bind<ObjectService>("objectService").to(ObjectService);
container.bind<R2Service>("r2Service").to(R2Service);

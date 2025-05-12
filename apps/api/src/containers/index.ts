import { initializeDatabase } from "@/db";
import { AccountRepository } from "@/db/repositories/account.repository";
import { SessionRepository } from "@/db/repositories/session.repository";
import { UserRepository } from "@/db/repositories/user.repository";
import { type DbClient } from "@/db/types";
import { AuthService } from "@/services/auth.service";
import { KakaoAuthService } from "@/services/kakao-auth.service";
import { Container } from "inversify";
export const container = new Container();
const db = initializeDatabase();

container.bind<DbClient>("db").toDynamicValue(() => db);

container.bind<UserRepository>("userRepository").to(UserRepository);
container.bind<AccountRepository>("accountRepository").to(AccountRepository);
container.bind<SessionRepository>("sessionRepository").to(SessionRepository);

container.bind<KakaoAuthService>("kakaoAuthService").to(KakaoAuthService);
container.bind<AuthService>("authService").to(AuthService);

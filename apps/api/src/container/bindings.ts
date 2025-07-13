import { Container } from "inversify";

import { TYPES } from "./types";

// Import interfaces
import type { AuthRepository } from "../modules/auth/data-access/auth.repository";
import type { SessionRepository } from "../modules/auth/data-access/session.repository";

// Import implementations
import { AuthRepositoryImpl } from "../modules/auth/data-access/auth.repository";
import { SessionRepositoryImpl } from "../modules/auth/data-access/session.repository";
import { AuthService } from "../modules/auth/domain/auth.service";
import { KakaoService } from "../modules/auth/external/kakao-oauth.service";
import { MagicLinkService } from "../modules/auth/external/magic-link.service";
import { Database, getDatabase } from "../shared/database/connection";

const container = new Container();

// Database binding
container.bind<Database>(TYPES.Database).toDynamicValue(() => getDatabase());

// Repository bindings
container
  .bind<AuthRepository>(TYPES.AuthRepository)
  .to(AuthRepositoryImpl)
  .inSingletonScope();

container
  .bind<SessionRepository>(TYPES.SessionRepository)
  .to(SessionRepositoryImpl)
  .inSingletonScope();

// Service bindings
container
  .bind<MagicLinkService>(TYPES.MagicLinkService)
  .to(MagicLinkService)
  .inSingletonScope();

container
  .bind<KakaoService>(TYPES.KakaoService)
  .to(KakaoService)
  .inSingletonScope();

container
  .bind<AuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope();

export { container };

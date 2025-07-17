const TYPES = {
  // Database
  Database: Symbol.for("Database"),

  // Repositories
  AuthRepository: Symbol.for("AuthRepository"),
  SessionRepository: Symbol.for("SessionRepository"),
  UserRepository: Symbol.for("UserRepository"),

  // Services
  AuthService: Symbol.for("AuthService"),
  MagicLinkService: Symbol.for("MagicLinkService"),
  KakaoService: Symbol.for("KakaoService"),
  UserService: Symbol.for("UserService"),
  UploadService: Symbol.for("UploadService"),
  R2Service: Symbol.for("R2Service"),
} as const;

export { TYPES };

const TYPES = {
  // Database
  Database: Symbol.for("Database"),
  
  // Repositories
  AuthRepository: Symbol.for("AuthRepository"),
  SessionRepository: Symbol.for("SessionRepository"),
  
  // Services
  AuthService: Symbol.for("AuthService"),
  MagicLinkService: Symbol.for("MagicLinkService"),
  KakaoService: Symbol.for("KakaoService"),
} as const;

export { TYPES };
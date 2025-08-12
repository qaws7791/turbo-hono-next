const TYPES = {
  // Database
  Database: Symbol.for("Database"),

  // Repositories
  AuthRepository: Symbol.for("AuthRepository"),
  SessionRepository: Symbol.for("SessionRepository"),
  UserRepository: Symbol.for("UserRepository"),
  ProjectRepository: Symbol.for("ProjectRepository"),
  CategoryRepository: Symbol.for("CategoryRepository"),
  BookmarkRepository: Symbol.for("BookmarkRepository"),

  // Services
  AuthService: Symbol.for("AuthService"),
  MagicLinkService: Symbol.for("MagicLinkService"),
  KakaoService: Symbol.for("KakaoService"),
  UserService: Symbol.for("UserService"),
  UploadService: Symbol.for("UploadService"),
  R2Service: Symbol.for("R2Service"),
  ProjectService: Symbol.for("ProjectService"),
  CategoryService: Symbol.for("CategoryService"),
  CategorySeedService: Symbol.for("CategorySeedService"),
} as const;

export { TYPES };

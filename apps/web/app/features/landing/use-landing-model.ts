export type LandingModel = {
  primaryHref: string;
};

export function useLandingModel(input: { isAuthenticated: boolean }): LandingModel {
  return { primaryHref: input.isAuthenticated ? "/home" : "/login" };
}


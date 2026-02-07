export type JwtRole = "SELLER" | "COURIER" | "ADMIN";

export type JwtUser = {
  sub: string;
  email: string;
  role: JwtRole;
  iat?: number;
  exp?: number;
};

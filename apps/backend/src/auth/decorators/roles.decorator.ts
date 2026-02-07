import { SetMetadata } from "@nestjs/common";
import { JwtRole } from "../types/jwt-user.type";

export const ROLES_KEY = "roles";
export const Roles = (...roles: JwtRole[]) => SetMetadata(ROLES_KEY, roles);

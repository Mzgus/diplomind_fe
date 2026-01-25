import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";

export const Endpoints = {
  // Auth
  login: AuthService.login,
  logout: AuthService.logout,
  refreshTokens: AuthService.refreshTokens,
  verifyToken: AuthService.verifyToken,

  // Users
  getUsers: UsersService.getAllUsers,
};

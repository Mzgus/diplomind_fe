import API from "./caller.services";

const login = (formData: any) => {
  return API.post("/login", formData);
};

const logout = () => {
  return API.get("/logout");
};

const refreshTokens = () => {
  return API.get("/refresh_tokens");
};

const verifyToken = () => {
  return API.get("/verify_token");
};

const getMyProfiles = () => {
  return API.get("/me/profiles");
};

const switchProfile = (user_sheet_id: number) => {
  return API.post("/auth/switch-profile", { user_sheet_id });
};

export const AuthService = {
  login,
  logout,
  refreshTokens,
  verifyToken,
  getMyProfiles,
  switchProfile,
};

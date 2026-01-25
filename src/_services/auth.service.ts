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

export const AuthService = {
  login,
  logout,
  refreshTokens,
  verifyToken,
};

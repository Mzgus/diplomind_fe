import API from "./caller.services";

// Utilisateurs

let login = (formData: any) => {
  return API.post("/login", formData);
};

let logout = () => {
  return API.get("/logout");
};

let refreshTokens = () => {
  return API.get("/refresh_tokens");
};

let getUsers = () => {
  return API.get("/users");
};

export const Endpoints = {
  login,
  logout,
  refreshTokens,
  getUsers,
};

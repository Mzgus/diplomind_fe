import API from "./caller.services";

// Utilisateurs

let login = (formData: any) => {
  return API.post("/login", formData);
};

let logout = () => {
  return API.get("/logout");
};


export const Endpoints = {
  login,
  logout,
};

import API from "./caller.services";

// Core User Operations
const getAllUsers = (params?: any) => {
  return API.get("/users", { params });
};

const getUserById = (id: number) => {
  return API.get(`/users/${id}`);
};

const getUserByEmail = (email: string) => {
  return API.get(`/users/email/${email}`);
};

// User Sheets (Admin)
const getAllUserSheets = () => {
  return API.get("/users_sheets");
};

const createUserSheet = (data: any) => {
  return API.post("/users_sheets", data);
};

const getUserSheet = (id: number) => {
  return API.get(`/users_sheets/${id}`);
};

const updateUserSheet = (id: number, data: any) => {
  return API.put(`/users_sheets/${id}`, data);
};

const deleteUserSheet = (id: number) => {
  return API.delete(`/users_sheets/${id}`);
};

// User Auth (Admin)
const createUserAuth = (data: any) => {
  return API.post("/users_auth", data);
};

const getUserAuth = (id: number) => {
  return API.get(`/users_auth/${id}`);
};

const deleteUserAuth = (id: number) => {
  return API.delete(`/users_auth/${id}`);
};

const updateUserAuthEmail = (id: number, email: string) => {
  return API.patch(`/users_auth/${id}/email`, { email });
};

const updateUserAuthPassword = (id: number, pwd: string) => {
  return API.patch(`/users_auth/${id}/password`, { pwd });
};

const createAccount = (email: string) => {
  return API.post("/accounts", { email });
};

// Student Dashboard
const getUserCourses = (userId: number) => {
  return API.get(`/users/${userId}/courses`);
};

const getUserSteps = (userId: number) => {
  return API.get(`/users/${userId}/steps`);
};

const getUserSkills = (userId: number) => {
  return API.get(`/users/${userId}/skills`);
};

export const UsersService = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getAllUserSheets,
  createUserSheet,
  getUserSheet,
  updateUserSheet,
  deleteUserSheet,
  createUserAuth,
  getUserAuth,
  deleteUserAuth,
  updateUserAuthEmail,
  updateUserAuthPassword,
  createAccount,
  getUserCourses,
  getUserSteps,
  getUserSkills,
};

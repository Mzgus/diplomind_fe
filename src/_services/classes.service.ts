import API from "./caller.services";

// CRUD
const getAllClasses = () => {
  return API.get("/classes");
};

const createClass = (data: any) => {
  return API.post("/classes", data);
};

const getClassById = (id: number) => {
  return API.get(`/classes/${id}`);
};

const updateClass = (id: number, data: any) => {
  return API.put(`/classes/${id}`, data);
};

const deleteClass = (id: number) => {
  return API.delete(`/classes/${id}`);
};

// Dashboard
const getTeacherClasses = (teacherId: number) => {
  return API.get(`/teachers/${teacherId}/classes`);
};

// Associations (User-Classes)
const assignUserToClass = (data: { user_id: number; class_id: number }) => {
  return API.post("/user-classes", data);
};

const getUserClasses = (userId: number) => {
  return API.get(`/users/${userId}/classes`);
};

const getClassUsers = (classId: number) => {
  return API.get(`/classes/${classId}/users`);
};

const removeUserFromClass = (userId: number, classId: number) => {
  return API.delete(`/users/${userId}/classes/${classId}`);
};

export const ClassesService = {
  getAllClasses,
  createClass,
  getClassById,
  updateClass,
  deleteClass,
  getTeacherClasses,
  assignUserToClass,
  getUserClasses,
  getClassUsers,
  removeUserFromClass,
};

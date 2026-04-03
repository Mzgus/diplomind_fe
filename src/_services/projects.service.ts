import API from "./caller.services";

// CRUD
const getAllProjects = () => {
  return API.get("/projects");
};

const createProject = (data: any) => {
  return API.post("/projects", data);
};

const getProjectById = (id: number) => {
  return API.get(`/projects/${id}`);
};

const updateProject = (id: number, data: any) => {
  return API.put(`/projects/${id}`, data);
};

const deleteProject = (id: number) => {
  return API.delete(`/projects/${id}`);
};

// By Course
const getProjectsByCourse = (courseId: number) => {
  return API.get(`/courses/${courseId}/projects`);
};

// Dashboard (Student)
const getStudentProjects = (studentId: number) => {
  return API.get(`/users/${studentId}/projects`);
};

export const ProjectsService = {
  getAllProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectsByCourse,
  getStudentProjects,
};

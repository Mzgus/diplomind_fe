import API from "./caller.services";

// CRUD
const getAllSteps = () => {
  return API.get("/steps");
};

const createStep = (data: any) => {
  return API.post("/steps", data);
};

const getStepById = (id: number) => {
  return API.get(`/steps/${id}`);
};

const updateStep = (id: number, data: any) => {
  return API.put(`/steps/${id}`, data);
};

const deleteStep = (id: number) => {
  return API.delete(`/steps/${id}`);
};

// By Project
const getStepsByProject = (projectId: number) => {
  return API.get(`/projects/${projectId}/steps`);
};

// Step-Skills Associations
const linkSkillToStep = (data: { step_id: number; skill_id: number }) => {
  return API.post("/step-skills", data);
};

const getStepSkills = (stepId: number) => {
  return API.get(`/steps/${stepId}/skills`);
};

const getSkillSteps = (skillId: number) => {
  return API.get(`/skills/${skillId}/steps`);
};

const unlinkSkillFromStep = (stepId: number, skillId: number) => {
  return API.delete(`/steps/${stepId}/skills/${skillId}`);
};

export const StepsService = {
  getAllSteps,
  createStep,
  getStepById,
  updateStep,
  deleteStep,
  getStepsByProject,
  linkSkillToStep,
  getStepSkills,
  getSkillSteps,
  unlinkSkillFromStep,
};

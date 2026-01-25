import API from "./caller.services";

// CRUD
const getAllSkills = () => {
  return API.get("/skills");
};

const createSkill = (data: any) => {
  return API.post("/skills", data);
};

const getSkillById = (id: number) => {
  return API.get(`/skills/${id}`);
};

const updateSkill = (id: number, data: any) => {
  return API.put(`/skills/${id}`, data);
};

const deleteSkill = (id: number) => {
  return API.delete(`/skills/${id}`);
};

export const SkillsService = {
  getAllSkills,
  createSkill,
  getSkillById,
  updateSkill,
  deleteSkill,
};

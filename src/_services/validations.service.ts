import API from "./caller.services";

const createValidation = (data: {
  user_id: number;
  skill_id: number;
  status: string;
  comment?: string;
}) => {
  return API.post("/skill-validations", data);
};

const getUserValidations = (userId: number) => {
  return API.get(`/skill-validations/user/${userId}`);
};

const getPendingValidations = () => {
  return API.get("/skill-validations/pending");
};

const getValidation = (userId: number, skillId: number) => {
  return API.get(`/skill-validations/${userId}/${skillId}`);
};

const updateValidationStatus = (
  userId: number,
  skillId: number,
  data: { status: string; comment?: string }
) => {
  return API.patch(`/skill-validations/${userId}/${skillId}`, data);
};

const deleteValidation = (userId: number, skillId: number) => {
  return API.delete(`/skill-validations/${userId}/${skillId}`);
};

// Dashboard (Student)
const getStudentCourseValidations = (userId: number, courseId: number) => {
  return API.get(`/users/${userId}/courses/${courseId}/validations`);
};

export const ValidationsService = {
  createValidation,
  getUserValidations,
  getPendingValidations,
  getValidation,
  updateValidationStatus,
  deleteValidation,
  getStudentCourseValidations,
};

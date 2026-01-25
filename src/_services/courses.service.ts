import API from "./caller.services";

// CRUD
const getAllCourses = () => {
  return API.get("/courses");
};

const createCourse = (data: any) => {
  return API.post("/courses", data);
};

const getCourseById = (id: number) => {
  return API.get(`/courses/${id}`);
};

const updateCourse = (id: number, data: any) => {
  return API.put(`/courses/${id}`, data);
};

const deleteCourse = (id: number) => {
  return API.delete(`/courses/${id}`);
};

// User-Courses Associations (Enrollments)
const assignUserToCourse = (data: { user_id: number; course_id: number }) => {
  return API.post("/user-courses", data);
};

const getUserCourses = (userId: number) => {
  return API.get(`/users/${userId}/courses`);
};

const getCourseUsers = (courseId: number) => {
  return API.get(`/courses/${courseId}/users`);
};

const removeUserFromCourse = (userId: number, courseId: number) => {
  return API.delete(`/users/${userId}/courses/${courseId}`);
};

// Course-Classes Associations
const linkCourseToClass = (data: { course_id: number; class_id: number }) => {
  return API.post("/course-classes", data);
};

const getCourseClasses = (courseId: number) => {
  return API.get(`/courses/${courseId}/classes`);
};

const getClassCourses = (classId: number) => {
  return API.get(`/classes/${classId}/courses`);
};

const unlinkCourseFromClass = (courseId: number, classId: number) => {
  return API.delete(`/courses/${courseId}/classes/${classId}`);
};

// Course-Skills Associations
const linkSkillToCourse = (data: { course_id: number; skill_id: number }) => {
  return API.post("/course-skills", data);
};

const getCourseSkills = (courseId: number) => {
  return API.get(`/courses/${courseId}/skills`);
};

const getSkillCourses = (skillId: number) => {
  return API.get(`/skills/${skillId}/courses`);
};

const unlinkSkillFromCourse = (courseId: number, skillId: number) => {
  return API.delete(`/courses/${courseId}/skills/${skillId}`);
};

export const CoursesService = {
  getAllCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  assignUserToCourse,
  getUserCourses,
  getCourseUsers,
  removeUserFromCourse,
  linkCourseToClass,
  getCourseClasses,
  getClassCourses,
  unlinkCourseFromClass,
  linkSkillToCourse,
  getCourseSkills,
  getSkillCourses,
  unlinkSkillFromCourse,
};

import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import StudentDashboard from "../components/organisms/StudentDashboard";
import TeacherDashboard from "../components/organisms/TeacherDashboard";
import AdminDashboard from "../components/organisms/AdminDashboard";
import { UsersService } from "../_services/users.service";
import { ValidationsService } from "../_services/validations.service";
import { CoursesService } from "../_services/courses.service";
import { ProjectsService } from "../_services/projects.service";
import { SkillsService } from "../_services/skills.service";
import { ClassesService } from "../_services/classes.service";
import { StepsService } from "../_services/steps.service";
import { AuditService } from "../_services/audit.service";

const Home: React.FC = () => {
  const context = useContext(AuthContext);
  if (!context) return null;
  const { user } = context;
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [studentData, setStudentData] = useState<any>({ projects: [], validatedSteps: [], stats: { validatedSkills: 0, pendingValidations: 0, activeProjects: 0 } });
  const [teacherData, setTeacherData] = useState<any>({ classes: [], pendingValidations: [], stats: { totalStudents: 0, activeClasses: 0, pendingCount: 0 } });
  const [adminData, setAdminData] = useState<any>({ auditLog: [], systemStatus: { dbStatus: "online", apiLatency: 0, uptime: "0d 0h 0m" }, stats: { totalUsers: 0, totalCourses: 0, totalProjects: 0 } });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const role = user.user_role;

        // Common data for mapping IDs to Names
        const [allSkillsRes, allUsersRes] = await Promise.all([
          SkillsService.getAllSkills(),
          UsersService.getAllUsers({ limit: 1000 })
        ]);

        const skillMap = new Map<number, any>(allSkillsRes.data.map((s: any) => [s.id, s]));
        const userMap = new Map<number, any>(allUsersRes.data.data.map((u: any) => [u.user_id, u]));

        if (role === "student") {
          const [validationsRes, userCoursesRes] = await Promise.all([
            ValidationsService.getUserValidations(user.user_id),
            UsersService.getUserCourses(user.user_id)
          ]);

          const userValidations = validationsRes.data;
          const validatedSkillIds = new Set(userValidations.filter((v: any) => v.status === "validated").map((v: any) => v.skill_id));

          // Get projects and their steps
          let projectsWithProgress: any[] = [];
          let validatedStepsList: any[] = [];

          if (userCoursesRes.data.length > 0) {
            const projectsPromises = userCoursesRes.data.map((c: any) => ProjectsService.getProjectsByCourse(c.id));
            const projectsResults = await Promise.all(projectsPromises);
            const allProjects = projectsResults.flatMap(res => res.data);

            const detailedProjects = await Promise.all(allProjects.map(async (p: any) => {
              const stepsRes = await StepsService.getStepsByProject(p.id);
              const steps = stepsRes.data;
              
              const stepsWithValidation = await Promise.all(steps.map(async (step: any) => {
                const stepSkillsRes = await StepsService.getStepSkills(step.id);
                const stepSkills = stepSkillsRes.data;
                const isStepValidated = stepSkills.length > 0 && stepSkills.every((s: any) => validatedSkillIds.has(s.id));
                return { ...step, isValidated: isStepValidated, projectName: p.name };
              }));

              const validatedStepsCount = stepsWithValidation.filter(s => s.isValidated).length;
              const progress = steps.length > 0 ? Math.round((validatedStepsCount / steps.length) * 100) : 0;
              
              validatedStepsList.push(...stepsWithValidation.filter(s => s.isValidated));

              return { ...p, progress, status: progress === 100 ? "Terminé" : "En cours" };
            }));

            projectsWithProgress = detailedProjects;
          }

          setStudentData({
            projects: projectsWithProgress.slice(0, 3),
            validatedSteps: validatedStepsList.sort((a, b) => b.id - a.id).slice(0, 5),
            stats: {
              validatedSkills: validatedSkillIds.size,
              pendingValidations: userValidations.filter((v: any) => v.status === "pending").length,
              activeProjects: projectsWithProgress.length
            }
          });
        } else if (role === "teacher") {
          const [teacherClassesRes, pendingRes] = await Promise.all([
            ClassesService.getTeacherClasses(user.user_id),
            ValidationsService.getPendingValidations()
          ]);

          let teacherStudentIds = new Set<number>();
          if (teacherClassesRes.data.length > 0) {
             const studentsPromises = teacherClassesRes.data.map((c: any) => ClassesService.getClassUsers(c.id));
             const studentsResults = await Promise.all(studentsPromises);
             teacherStudentIds = new Set(studentsResults.flatMap(res => res.data.map((s: any) => s.user_id)));
          }

          const filteredPending = pendingRes.data.filter((v: any) => teacherStudentIds.has(v.user_id));

          setTeacherData({
            classes: teacherClassesRes.data,
            pendingValidations: filteredPending.slice(0, 5).map((v: any) => {
              const student = userMap.get(v.user_id);
              const skill = skillMap.get(v.skill_id);
              return { 
                ...v, 
                user_name: student ? `${student.user_firstname} ${student.user_lastname}` : `Élève ${v.user_id}`, 
                skill_name: skill?.name || `Skill ${v.skill_id}` 
              };
            }),
            stats: {
              totalStudents: teacherStudentIds.size,
              activeClasses: teacherClassesRes.data.length,
              pendingCount: filteredPending.length
            }
          });
        } else if (role === "admin") {
          const start = performance.now();
          const [coursesRes, projectsRes, logsRes] = await Promise.all([
            CoursesService.getAllCourses(),
            ProjectsService.getAllProjects(),
            AuditService.getAuditLogs({ limit: 10 })
          ]);
          const latency = Math.round(performance.now() - start);

          setAdminData({
            auditLog: logsRes.data.map((log: any) => {
              const logUser = userMap.get(log.user_id);
              return {
                user: logUser ? `${logUser.user_firstname} ${logUser.user_lastname}` : `User ${log.user_id}`,
                action: log.action,
                time: new Date(log.created_at).toLocaleString(),
                type: log.log_type
              };
            }),
            systemStatus: {
              dbStatus: "online",
              apiLatency: latency,
              uptime: "12d 4h 32m"
            },
            stats: {
              totalUsers: allUsersRes.data.total,
              totalCourses: coursesRes.data.length,
              totalProjects: projectsRes.data.length
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) return <div className="p-6 text-text-main">Chargement du tableau de bord...</div>;
  if (!user) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-main mb-2">
          Bonjour, {user.user_firstname} !
        </h1>
        <p className="text-text-muted">
          Voici ce qui se passe sur votre espace aujourd'hui.
        </p>
      </header>

      {user.user_role === "student" && <StudentDashboard {...studentData} />}
      {user.user_role === "teacher" && <TeacherDashboard {...teacherData} />}
      {user.user_role === "admin" && <AdminDashboard {...adminData} />}
    </div>
  );
};

export default Home;

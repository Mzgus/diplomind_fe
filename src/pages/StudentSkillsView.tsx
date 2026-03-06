import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { UsersService } from "../_services/users.service";
import { ProjectsService } from "../_services/projects.service";
import { StepsService } from "../_services/steps.service";
import { ValidationsService } from "../_services/validations.service";

// --- Types ---
interface Course { id: number; name: string; description?: string; }
interface Project { id: number; name: string; course_id?: number; }
interface Step { id: number; name: string; project_id?: number; }
interface Skill { id: number; name: string; description?: string; }
interface SkillValidation {
  skill_id: number;
  status: string;
  comment?: string;
  validated_at?: string;
}

// --- Status helpers ---
const STATUS_LABEL: Record<string, string> = {
  validated: "Validé",
  rejected: "Non validé",
  partially_validated: "Partiellement validé",
  pending: "Non évalué",
};

const STATUS_COLORS: Record<string, { badge: string; dot: string }> = {
  validated:           { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" },
  rejected:            { badge: "bg-red-500/15 text-red-400 border-red-500/30",             dot: "bg-red-400" },
  partially_validated: { badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",       dot: "bg-amber-400" },
  pending:             { badge: "bg-slate-500/15 text-slate-400 border-slate-500/30",        dot: "bg-slate-500" },
};

// --- Comment Modal ---
interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: Skill | null;
  validation: SkillValidation | null;
}

const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, skill, validation }) => {
  if (!isOpen || !skill) return null;

  const status = validation?.status || "pending";
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const label = STATUS_LABEL[status] || status;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1f2e] border border-[#2a3040] rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
            {skill.description && (
              <p className="text-sm text-slate-400 mt-1">{skill.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-slate-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colors.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {label}
          </span>
          {validation?.validated_at && (
            <span className="text-xs text-slate-500">
              {new Date(validation.validated_at).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>

        {/* Comment */}
        <div className="bg-[#111827] rounded-xl p-4 min-h-[80px]">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-medium">Commentaire</p>
          {validation?.comment ? (
            <p className="text-sm text-slate-300 leading-relaxed">{validation.comment}</p>
          ) : (
            <p className="text-sm text-slate-600 italic">Aucun commentaire pour cette compétence.</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-[#2a3040] hover:bg-[#323a50] text-slate-300 rounded-lg text-sm font-medium transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---
const StudentSkillsView: React.FC = () => {
  const { user } = useContext(AuthContext);
  const userId = user?.user_id;

  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);

  // Map courseId → its projects
  const [projectsByCourse, setProjectsByCourse] = useState<Record<number, Project[]>>({});
  // Map projectId → its steps-with-skills
  const [stepsByProject, setStepsByProject] = useState<Record<number, { step: Step; skills: Skill[] }[]>>({});
  // Map skillId → validation
  const [validations, setValidations] = useState<Record<number, SkillValidation>>({});

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Load courses + all validations on mount
  useEffect(() => {
    if (!userId) return;
    const init = async () => {
      try {
        setLoading(true);
        const [coursesRes, valRes] = await Promise.all([
          UsersService.getUserCourses(userId),
          ValidationsService.getUserValidations(userId),
        ]);

        const coursesData: Course[] = Array.isArray(coursesRes.data) ? coursesRes.data : [];
        setCourses(coursesData);

        // Build validation map
        const valMap: Record<number, SkillValidation> = {};
        const vals = Array.isArray(valRes.data) ? valRes.data : [];
        vals.forEach((v: SkillValidation) => {
          valMap[v.skill_id] = v;
        });
        setValidations(valMap);

        // Auto-expand first course
        if (coursesData.length > 0) {
          setExpandedCourseId(coursesData[0].id);
        }
      } catch (err) {
        console.error("Failed to init student skills view", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [userId]);

  // 2. When a course is expanded → load its projects
  useEffect(() => {
    if (!expandedCourseId || projectsByCourse[expandedCourseId]) return;
    const fetch = async () => {
      try {
        const res = await ProjectsService.getProjectsByCourse(expandedCourseId);
        const projects: Project[] = Array.isArray(res.data) ? res.data : [];
        setProjectsByCourse((prev) => ({ ...prev, [expandedCourseId]: projects }));
        // Auto-expand first project
        if (projects.length > 0) setExpandedProjectId(projects[0].id);
      } catch (err) {
        console.error("Failed to fetch projects for course", err);
        setProjectsByCourse((prev) => ({ ...prev, [expandedCourseId]: [] }));
      }
    };
    fetch();
  }, [expandedCourseId]);

  // 3. When a project is expanded → load its steps + skills
  useEffect(() => {
    if (!expandedProjectId || stepsByProject[expandedProjectId]) return;
    const fetch = async () => {
      try {
        const stepsRes = await StepsService.getStepsByProject(expandedProjectId);
        const steps: Step[] = Array.isArray(stepsRes.data) ? stepsRes.data : [];

        const stepsWithSkills = await Promise.all(
          steps.map(async (step) => {
            try {
              const skillsRes = await StepsService.getStepSkills(step.id);
              return { step, skills: Array.isArray(skillsRes.data) ? skillsRes.data : [] };
            } catch {
              return { step, skills: [] };
            }
          })
        );

        setStepsByProject((prev) => ({ ...prev, [expandedProjectId]: stepsWithSkills }));
      } catch (err) {
        console.error("Failed to fetch steps/skills for project", err);
        setStepsByProject((prev) => ({ ...prev, [expandedProjectId]: [] }));
      }
    };
    fetch();
  }, [expandedProjectId]);

  const toggleCourse = (id: number) => {
    setExpandedCourseId((prev) => (prev === id ? null : id));
    setExpandedProjectId(null);
  };

  const toggleProject = (id: number) => {
    setExpandedProjectId((prev) => (prev === id ? null : id));
  };

  // Count validated skills for progress
  const countValidated = (skills: Skill[]) =>
    skills.filter((s) => validations[s.id]?.status === "validated").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Chargement de vos compétences...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Aucun cours associé à votre profil.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Mes Compétences</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Consultez l'état de validation de vos compétences par cours et projet.
          </p>
        </div>

        {/* Course list */}
        <div className="space-y-3">
          {courses.map((course) => {
            const projects = projectsByCourse[course.id] ?? null;
            const isExpanded = expandedCourseId === course.id;

            return (
              <div key={course.id} className="bg-[#1a1f2e] border border-[#2a3040] rounded-2xl overflow-hidden">
                {/* Course header — clickable */}
                <button
                  onClick={() => toggleCourse(course.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="font-semibold text-white">{course.name}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Projects inside the course */}
                {isExpanded && (
                  <div className="border-t border-[#2a3040] divide-y divide-[#2a3040]">
                    {projects === null ? (
                      <div className="p-4 text-center text-slate-500 text-sm">Chargement des projets...</div>
                    ) : projects.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-sm">Aucun projet dans ce cours.</div>
                    ) : (
                      projects.map((project) => {
                        const stepsData = stepsByProject[project.id] ?? null;
                        const isProjExpanded = expandedProjectId === project.id;
                        const allSkills = stepsData?.flatMap((sd) => sd.skills) ?? [];
                        const validated = countValidated(allSkills);

                        return (
                          <div key={project.id} className="bg-[#111827]/50">
                            {/* Project row — clickable */}
                            <button
                              onClick={() => toggleProject(project.id)}
                              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-md bg-violet-500/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </div>
                                <span className="text-sm font-medium text-slate-200">{project.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {stepsData && allSkills.length > 0 && (
                                  <span className="text-xs text-slate-500">
                                    {validated}/{allSkills.length} validées
                                  </span>
                                )}
                                <svg
                                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isProjExpanded ? "rotate-180" : ""}`}
                                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </button>

                            {/* Steps + Skills */}
                            {isProjExpanded && (
                              <div className="px-6 pb-4 space-y-4">
                                {stepsData === null ? (
                                  <p className="text-slate-500 text-sm py-2">Chargement des étapes...</p>
                                ) : stepsData.length === 0 ? (
                                  <p className="text-slate-500 text-sm py-2">Aucune étape pour ce projet.</p>
                                ) : (
                                  stepsData.map(({ step, skills }) => (
                                    <div key={step.id}>
                                      {/* Step label */}
                                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-3">
                                        {step.name}
                                      </p>
                                      {skills.length === 0 ? (
                                        <p className="text-xs text-slate-600 italic pl-1">Aucune compétence associée.</p>
                                      ) : (
                                        <div className="flex flex-wrap gap-2">
                                          {skills.map((skill) => {
                                            const val = validations[skill.id];
                                            const status = val?.status || "pending";
                                            const colors = STATUS_COLORS[status];
                                            const label = STATUS_LABEL[status];
                                            const hasComment = !!val?.comment;

                                            return (
                                              <button
                                                key={skill.id}
                                                onClick={() => setSelectedSkill(skill)}
                                                title={`${label}${skill.description ? ` — ${skill.description}` : ""}`}
                                                className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 hover:scale-105 active:scale-95 ${colors.badge}`}
                                              >
                                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                                                <span>{skill.name}</span>
                                                {hasComment && (
                                                  <svg className="w-3 h-3 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                                                  </svg>
                                                )}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comment modal on skill click */}
      <CommentModal
        isOpen={!!selectedSkill}
        onClose={() => setSelectedSkill(null)}
        skill={selectedSkill}
        validation={selectedSkill ? validations[selectedSkill.id] || null : null}
      />
    </div>
  );
};

export default StudentSkillsView;

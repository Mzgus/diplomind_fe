import React, { useState, useEffect, useContext } from "react";
import CommentModal from "./CommentModal";
import { ProjectsService } from "../../_services/projects.service";
import { StepsService } from "../../_services/steps.service";
import { UsersService } from "../../_services/users.service";
import { ValidationsService } from "../../_services/validations.service";
import type { Course, Skill, Step, Project, SkillValidation } from "../../types";
import { AuthContext } from "../../context/AuthContext";

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

interface StudentSkillsAccordionProps {
  searchQuery: string;
}

const StudentSkillsAccordion: React.FC<StudentSkillsAccordionProps> = ({ searchQuery }) => {
  const { user } = useContext(AuthContext);
  const userId = user?.user_id;

  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);

  const [projectsByCourse, setProjectsByCourse] = useState<Record<number, Project[]>>({});
  const [stepsByProject, setStepsByProject] = useState<Record<number, { step: Step; skills: Skill[] }[]>>({});
  const [validations, setValidations] = useState<Record<number, SkillValidation>>({});

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);

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

        const valMap: Record<number, SkillValidation> = {};
        const vals = Array.isArray(valRes.data) ? valRes.data : [];
        vals.forEach((v: SkillValidation) => { valMap[v.skill_id] = v; });
        setValidations(valMap);

        if (coursesData.length > 0) setExpandedCourseId(coursesData[0].id);
      } catch (err) {
        console.error("Failed to init student skills view", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [userId]);

  useEffect(() => {
    if (!expandedCourseId || projectsByCourse[expandedCourseId]) return;
    const fetch = async () => {
      try {
        const res = await ProjectsService.getProjectsByCourse(expandedCourseId);
        const projects: Project[] = Array.isArray(res.data) ? res.data : [];
        setProjectsByCourse((prev) => ({ ...prev, [expandedCourseId]: projects }));
        if (projects.length > 0) setExpandedProjectId(projects[0].id);
      } catch {
        setProjectsByCourse((prev) => ({ ...prev, [expandedCourseId]: [] }));
      }
    };
    fetch();
  }, [expandedCourseId]);

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
      } catch {
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

  const countValidated = (skills: Skill[]) =>
    skills.filter((s) => validations[s.id]?.status === "validated").length;

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-4 text-center text-text-muted">Chargement de vos compétences...</div>;
  if (courses.length === 0) return <div className="p-4 text-center text-text-muted">Aucun cours associé à votre profil.</div>;

  return (
    <div className="space-y-4">
      {filteredCourses.map((course) => {
        const projects = projectsByCourse[course.id] ?? null;
        const isExpanded = expandedCourseId === course.id;

        return (
          <div key={course.id} className="border border-border rounded-lg overflow-hidden bg-surface">
            <button
              onClick={() => toggleCourse(course.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors"
              type="button"
            >
              <div className="flex items-center gap-3">
                <svg
                  className={`h-5 w-5 text-text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <h2 className="text-xl font-semibold text-text-main">{course.name}</h2>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-border divide-y divide-border">
                {projects === null ? (
                  <div className="p-4 text-center text-text-muted text-sm">Chargement des projets...</div>
                ) : projects.length === 0 ? (
                  <div className="p-4 text-center text-text-muted text-sm">Aucun projet dans ce cours.</div>
                ) : (
                  projects.map((project) => {
                    const stepsData = stepsByProject[project.id] ?? null;
                    const isProjExpanded = expandedProjectId === project.id;
                    const allSkills = stepsData?.flatMap((sd) => sd.skills) ?? [];
                    const validated = countValidated(allSkills);

                    return (
                      <div key={project.id} className="bg-background/50">
                        <button
                          onClick={() => toggleProject(project.id)}
                          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-background transition-colors"
                          type="button"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-md font-medium text-text-main">{project.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {stepsData && allSkills.length > 0 && (
                              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                                {validated} / {allSkills.length} validées
                              </span>
                            )}
                            <svg
                              className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isProjExpanded ? "rotate-90" : ""}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>

                        {isProjExpanded && (
                          <div className="px-6 pb-4 space-y-4">
                            {stepsData === null ? (
                              <p className="text-text-muted text-sm py-2">Chargement des étapes...</p>
                            ) : stepsData.length === 0 ? (
                              <p className="text-text-muted text-sm py-2">Aucune étape pour ce projet.</p>
                            ) : (
                              stepsData.map(({ step, skills }) => (
                                <div key={step.id}>
                                  <p className="text-sm font-semibold text-text-main mb-2 mt-3">
                                    Étape : {step.name}
                                  </p>
                                  {skills.length === 0 ? (
                                    <p className="text-xs text-text-muted italic pl-1">Aucune compétence associée.</p>
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
                                            type="button"
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

      <CommentModal
        isOpen={!!selectedSkill}
        onClose={() => setSelectedSkill(null)}
        skill={selectedSkill}
        validation={selectedSkill ? validations[selectedSkill.id] || null : null}
      />
    </div>
  );
};

export default StudentSkillsAccordion;

import React, { useState, useEffect, useContext } from "react";
import SearchBar from "../components/molecules/SearchBar";
import Button from "../components/atoms/Button";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import SkillModal from "../components/organisms/SkillModal";
import StepAssociationModal from "../components/organisms/StepAssociationModal";
import { CoursesService } from "../_services/courses.service";
import { SkillsService } from "../_services/skills.service";
import { StepsService } from "../_services/steps.service";
import { ProjectsService } from "../_services/projects.service";
import { UsersService } from "../_services/users.service";
import { ValidationsService } from "../_services/validations.service";
import type { Course, Skill, Step, Project } from "../types";
import { AuthContext } from "../context/AuthContext";

// Extended types for UI
interface SkillValidation {
  skill_id: number;
  status: string;
  comment?: string;
  validated_at?: string;
}

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
        className="bg-surface border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-main">{skill.name}</h3>
            {skill.description && (
              <p className="text-sm text-text-muted mt-1">{skill.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-text-muted hover:text-text-main transition-colors p-1"
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
            <span className="text-xs text-text-muted">
              {new Date(validation.validated_at).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>

        {/* Comment */}
        <div className="bg-background rounded-xl p-4 min-h-[80px]">
          <p className="text-xs uppercase tracking-wider text-text-muted mb-2 font-medium">Commentaire</p>
          {validation?.comment ? (
            <p className="text-sm text-text-main leading-relaxed">{validation.comment}</p>
          ) : (
            <p className="text-sm text-text-muted italic">Aucun commentaire pour cette compétence.</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-secondary hover:bg-secondary-hover text-text-main rounded-lg text-sm font-medium transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

// --- Student Specific Accordion View ---
const StudentSkillsAccordion: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
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
        vals.forEach((v: SkillValidation) => {
          valMap[v.skill_id] = v;
        });
        setValidations(valMap);

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

  useEffect(() => {
    if (!expandedCourseId || projectsByCourse[expandedCourseId]) return;
    const fetch = async () => {
      try {
        const res = await ProjectsService.getProjectsByCourse(expandedCourseId);
        const projects: Project[] = Array.isArray(res.data) ? res.data : [];
        setProjectsByCourse((prev) => ({ ...prev, [expandedCourseId]: projects }));
        if (projects.length > 0) setExpandedProjectId(projects[0].id);
      } catch (err) {
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
      } catch (err) {
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

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-4 text-center text-text-muted">Chargement de vos compétences...</div>;
  }

  if (courses.length === 0) {
    return <div className="p-4 text-center text-text-muted">Aucun cours associé à votre profil.</div>;
  }

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

                                        // Apply searchQuery to inner skills to just visually mute them perhaps?
                                        // For simplicity, we just show all if the course matches, or we could conditionally render.
                                        // Here we show all skills.
                                        
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

      <CommentModal
        isOpen={!!selectedSkill}
        onClose={() => setSelectedSkill(null)}
        skill={selectedSkill}
        validation={selectedSkill ? validations[selectedSkill.id] || null : null}
      />
    </div>
  );
};

// Extended types for UI
interface StepWithProject extends Step {
    projectName?: string;
}

interface SkillWithSteps extends Skill {
    linkedSteps?: StepWithProject[];
}

interface CourseWithSkills extends Course {
    skills?: SkillWithSteps[];
    skillsLoaded?: boolean;
}

const Skills: React.FC = () => {
  const { user } = useContext(AuthContext);
  const canEdit = user?.user_role !== "student";
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<CourseWithSkills[]>([]);
  const [allSteps, setAllSteps] = useState<StepWithProject[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<{ id: number; name: string; description: string; courseId: string } | null>(null);
  const [isStepAssociationModalOpen, setIsStepAssociationModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillWithSteps | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ skill: Skill; courseId: number } | null>(null);

  const fetchGlobalData = async () => {
    try {
        setLoading(true);
        if (canEdit) {
            // Admin / Teacher: load all courses with their skills
            const [coursesRes, stepsRes, projectsRes] = await Promise.all([
                CoursesService.getAllCourses(),
                StepsService.getAllSteps(),
                ProjectsService.getAllProjects()
            ]);

            const projects: Project[] = projectsRes.data;
            const steps: Step[] = stepsRes.data;

            const enrichedSteps = steps.map(s => {
                const p = projects.find(proj => proj.id === s.project_id);
                return { ...s, projectName: p ? p.name : "Inconnu" };
            });

            setAllSteps(enrichedSteps);
            setAllProjects(projects);

            const rawCourses: Course[] = coursesRes.data;

            const coursesWithSkills = await Promise.all(rawCourses.map(async (course) => {
                try {
                    const skillsRes = await CoursesService.getCourseSkills(course.id);
                    const rawSkills: Skill[] = skillsRes.data;

                    const skillsWithSteps = await Promise.all(rawSkills.map(async (skill) => {
                         if (!skill.id) return { ...skill, linkedSteps: [] };
                         try {
                            const stepsRes = await StepsService.getSkillSteps(skill.id);
                            const skillSteps: Step[] = stepsRes.data;
                            const enrichedSkillSteps = skillSteps.map(s => {
                                const p = projects.find(proj => proj.id === s.project_id);
                                return { ...s, projectName: p ? p.name : "Inconnu" };
                            });
                            return { ...skill, linkedSteps: enrichedSkillSteps };
                         } catch {
                             return { ...skill, linkedSteps: [] };
                         }
                    }));

                    return { ...course, skills: skillsWithSteps, skillsLoaded: true };
                } catch (err) {
                    console.error(`Failed to fetch skills for course ${course.id}`, err);
                    return { ...course, skills: [], skillsLoaded: false };
                }
            }));

            setCourses(coursesWithSkills);
        }

    } catch (error) {
        console.error("Failed to fetch global data", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchGlobalData();
  }, [user]);

  const fetchCourseSkills = async (courseId: number) => {
      // Re-fetch logic for updates
      try {
          const skillsRes = await CoursesService.getCourseSkills(courseId);
          const rawSkills: Skill[] = skillsRes.data;

          const skillsWithSteps = await Promise.all(rawSkills.map(async (skill) => {
             if (!skill.id) return { ...skill, linkedSteps: [] };
             try {
                const stepsRes = await StepsService.getSkillSteps(skill.id);
                // Ensure unique items just in case? API should handle it.
                const skillSteps: Step[] = stepsRes.data;
                const enrichedSkillSteps = skillSteps.map(s => {
                    const p = allProjects.find(proj => proj.id === s.project_id);
                    return { ...s, projectName: p ? p.name : "Inconnu" };
                });
                return { ...skill, linkedSteps: enrichedSkillSteps };
             } catch (err) {
                 return { ...skill, linkedSteps: [] };
             }
          }));

          setCourses(prev => prev.map(c => {
               if (c.id === courseId) {
                   return { ...c, skills: skillsWithSteps, skillsLoaded: true };
               }
               return c;
          }));

      } catch (error) {
           console.error(`Failed to fetch skills for course ${courseId}`, error);
      }
  };

  const toggleCourse = (courseId: number) => {
    const newExpanded = new Set(expandedCourses);
    const isExpanding = !newExpanded.has(courseId);
    
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);

    if (isExpanding) {
        // Already loaded globally
    }
  };

  const handleSaveNewSkill = async (skillData: any) => {
      try {
         let skillId = skillData.id;
         const courseId = Number(skillData.courseId);

         if (skillId) {
             // Update
             await SkillsService.updateSkill(skillId, {
                 name: skillData.name,
                 description: skillData.description
             });
             // We might need to handle course change? 
             // If courseId changed, we need to unlink from old and link to new.
             // For simplicity, assuming validation prohibits course change or ignoring it for now as SkillModal implies linking.
         } else {
             // Create
             const res = await SkillsService.createSkill({
                 name: skillData.name,
                 description: skillData.description
             });
             skillId = res.data.id;
             // Link to course
             await CoursesService.linkSkillToCourse({
                 course_id: courseId,
                 skill_id: skillId
             });
         }

         // Refresh the specific course skills
         fetchCourseSkills(courseId);
         
         setIsCreateModalOpen(false);
         setSkillToEdit(null);
      } catch (error) {
          console.error("Failed to save skill", error);
      }
  };

  const handleEditSkill = (skill: Skill, courseId: number) => {
    setSkillToEdit({
      id: skill.id,
      name: skill.name,
      description: skill.description || "",
      courseId: courseId.toString(),
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenStepAssociation = (skill: SkillWithSteps) => {
    setSelectedSkill(skill);
    setIsStepAssociationModalOpen(true);
  };

  const handleSaveStepAssociations = async (stepIds: number[]) => {
    if (selectedSkill) {
       try {
           const currentIds = selectedSkill.linkedSteps?.map(s => s.id) || [];
           
           const added = stepIds.filter(id => !currentIds.includes(id));
           const removed = currentIds.filter(id => !stepIds.includes(id));

           for (const stepId of added) {
               await StepsService.linkSkillToStep({ step_id: stepId, skill_id: selectedSkill.id });
           }

           for (const stepId of removed) {
               await StepsService.unlinkSkillFromStep(stepId, selectedSkill.id);
           }

           // Refresh skills for the course to show updates
           // We need to find which course the selectedSkill belongs to
           // Or just refresh all expanded?
           // We can rely on 'selectedSkill' parent course.
           // Since we don't store parent course in selectedSkill, we iterate courses
           const course = courses.find(c => c.skills?.some(s => s.id === selectedSkill.id));
           if (course) {
               fetchCourseSkills(course.id);
           }
           
       } catch (error) {
           console.error("Failed to save step links", error);
       }
    }
    setIsStepAssociationModalOpen(false);
  };

  const handleOpenDeleteModal = (skill: Skill, courseId: number) => {
    setItemToDelete({ skill, courseId });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
          await SkillsService.deleteSkill(itemToDelete.skill.id);
          // Refresh course
          fetchCourseSkills(itemToDelete.courseId);
      } catch (error) {
          console.error("Failed to delete skill", error);
      }
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Filter courses and skills based on search
  // Note: Only filters LOADED skills.
  const filteredCourses = courses.map(course => ({
    ...course,
    skills: course.skills?.filter(skill =>
      (skill.name && skill.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (skill.description && skill.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (course.name && course.name.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || []
  })).filter(course => 
      // Show course if it matches search OR if it has matching skills
      (course.name && course.name.toLowerCase().includes(searchQuery.toLowerCase())) || (course.skills && course.skills.length > 0)
  );

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-4 text-text-main">Gestion des Compétences</h1>

      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="w-3/4">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une compétence, un cours..."
          />
        </div>
        <div className="w-1/4 flex gap-2">
          {canEdit && (
            <>
              <Button className="flex-1" onClick={() => setIsCreateModalOpen(true)}>
                Ajouter une compétence
              </Button>
              <Button
                className="flex-1 bg-secondary hover:bg-secondary-hover"
                onClick={() => (window.location.href = "/project-skills-validation")}
              >
                Valider des compétences
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Course Accordion */}
      {canEdit ? (
      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
             Aucun cours trouvé
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="border border-border rounded-lg overflow-hidden bg-surface">
              {/* Course Header */}
              <button
                onClick={() => toggleCourse(course.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors"
                disabled={false}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`h-5 w-5 text-text-muted transition-transform ${expandedCourses.has(course.id) ? "rotate-90" : ""
                      }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <h2 className="text-xl font-semibold text-text-main">{course.name}</h2>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {course.skillsLoaded ? (course.skills?.length || 0) : "..."} compétences
                  </span>
                </div>
              </button>

              {/* Skills List */}
              {expandedCourses.has(course.id) && (
                <div className="border-t border-border">
                  {!course.skillsLoaded ? (
                      <div className="p-4 text-center text-text-muted">Chargement des compétences...</div>
                  ) : course.skills?.length === 0 ? (
                      <div className="p-4 text-center text-text-muted">Aucune compétence associée.</div>
                  ) : (
                  course.skills?.map((skill, index) => (
                    <div
                      key={skill.id || `skill-${index}`}
                      className={`p-4 ${index !== 0 ? "border-t border-border" : ""} hover:bg-background/50 transition-colors`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-text-main">{skill.name}</h3>
                          </div>
                          <p className="text-sm text-text-muted mb-3">{skill.description}</p>

                          {/* Linked Steps */}
                          {skill.linkedSteps && skill.linkedSteps.length > 0 ? (
                            <div className="space-y-1">
                              {skill.linkedSteps.map((step, sIdx) => (
                                <div
                                  key={step.id || `step-${sIdx}`}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg text-sm mr-2 mb-2 group"
                                >
                                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  <span className="text-text-main font-medium">{step.projectName || "Inconnu"}</span>
                                  <span className="text-text-muted">-</span>
                                  <span className="text-text-muted">{step.name}</span>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      // Unlink single step
                                      try {
                                          await StepsService.unlinkSkillFromStep(step.id, skill.id);
                                          // Refresh
                                          fetchCourseSkills(course.id);
                                      } catch (err) {
                                          console.error("Error unlinking step", err);
                                      }
                                    }}
                                    className="ml-1 p-0.5 text-text-muted hover:text-danger-text transition-colors opacity-0 group-hover:opacity-100"
                                    title="Retirer cette étape"
                                  >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-text-muted italic">Aucune étape liée</p>
                          )}
                        </div>

                        {/* Action Buttons — teacher/admin only */}
                        {canEdit && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenStepAssociation(skill)}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Lier une étape
                          </button>
                          <button
                            onClick={() => handleEditSkill(skill, course.id)}
                            className="p-2 text-text-muted hover:text-text-main hover:bg-background rounded-full transition-colors"
                            title="Éditer cette compétence"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(skill, course.id)}
                            className="p-2 text-danger-text hover:bg-danger-bg rounded-full transition-colors"
                            title="Supprimer cette compétence"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        )}
                      </div>
                    </div>
                  ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      ) : (
         <StudentSkillsAccordion searchQuery={searchQuery} />
      )}

      {/* Modals */}
      <SkillModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSkillToEdit(null);
        }}
        onSave={handleSaveNewSkill}
        existingCourses={courses.map(c => ({ id: c.id.toString(), name: c.name }))}
        existingSteps={[]} // Not adding steps here, handled in separate modal
        skillToEdit={skillToEdit}
      />

      <StepAssociationModal
        isOpen={isStepAssociationModalOpen}
        onClose={() => setIsStepAssociationModalOpen(false)}
        onSave={handleSaveStepAssociations}
        skillName={selectedSkill?.name || ""}
        existingProjects={allProjects.map(p => ({ id: p.id, name: p.name }))}
        existingSteps={allSteps.map(s => ({ id: s.id, name: s.name, projectId: s.project_id }))}
        currentStepIds={selectedSkill?.linkedSteps?.map(s => s.id) || []}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.skill.name || ""}
        itemType="la compétence"
      />
    </div>
  );
};

export default Skills;

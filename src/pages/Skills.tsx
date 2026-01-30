import React, { useState, useEffect } from "react";
import SearchBar from "../components/molecules/SearchBar";
import Button from "../components/atoms/Button";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import SkillModal from "../components/organisms/SkillModal";
import StepAssociationModal from "../components/organisms/StepAssociationModal";
import { CoursesService } from "../_services/courses.service";
import { SkillsService } from "../_services/skills.service";
import { StepsService } from "../_services/steps.service";
import { ProjectsService } from "../_services/projects.service";
import type { Course, Skill, Step, Project } from "../types";

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

  // Fetch initial global data
  const fetchGlobalData = async () => {
    try {
        setLoading(true);
        const [coursesRes, stepsRes, projectsRes] = await Promise.all([
            CoursesService.getAllCourses(),
            StepsService.getAllSteps(),
            ProjectsService.getAllProjects()
        ]);

        const projects: Project[] = projectsRes.data;
        const steps: Step[] = stepsRes.data;
        const rawCourses: Course[] = coursesRes.data;
        
        // Enrich steps with project names for global usage
        const enrichedSteps = steps.map(s => {
            const p = projects.find(proj => proj.id === s.project_id);
            return {
                ...s,
                projectName: p ? p.name : "Inconnu"
            };
        });

        setAllSteps(enrichedSteps);
        setAllProjects(projects);

        // Fetch skills for ALL courses immediately
        const coursesWithSkills = await Promise.all(rawCourses.map(async (course) => {
            try {
                const skillsRes = await CoursesService.getCourseSkills(course.id);
                const rawSkills: Skill[] = skillsRes.data;

                // For each skill, fetch linked steps (This might be heavy, but requested "load every skills")
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
                     } catch (err) {
                         console.warn(`Failed to fetch steps for skill ${skill.id}`, err);
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

    } catch (error) {
        console.error("Failed to fetch global data", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

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
          <Button className="flex-1" onClick={() => setIsCreateModalOpen(true)}>
            Ajouter une compétence
          </Button>
          <Button
            className="flex-1 bg-secondary hover:bg-secondary-hover"
            onClick={() => (window.location.href = "/project-skills-validation")}
          >
            Valider des compétences
          </Button>
        </div>
      </div>

      {/* Course Accordion */}
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

                        {/* Action Buttons */}
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

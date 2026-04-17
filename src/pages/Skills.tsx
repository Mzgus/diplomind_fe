import React, { useState, useEffect, useContext, useMemo } from "react";
import SearchBar from "../components/molecules/SearchBar";
import Button from "../components/atoms/Button";
import AdminSkillsCourseAccordion from "../components/organisms/AdminSkillsCourseAccordion";
import StudentSkillsAccordion from "../components/organisms/StudentSkillsAccordion";
import SkillModal from "../components/organisms/SkillModal";
import StepAssociationModal from "../components/organisms/StepAssociationModal";
import SkillStepAssociationModal from "../components/organisms/SkillStepAssociationModal";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import { AuthContext } from "../context/AuthContext";

import { CoursesService } from "../_services/courses.service";
import { SkillsService } from "../_services/skills.service";
import { StepsService } from "../_services/steps.service";
import { ProjectsService } from "../_services/projects.service";
import type {
  Course, Skill, Step, Project,
  CourseWithSkills, SkillWithSteps, StepWithProject,
} from "../types";

interface SkillToEdit {
  id: number;
  name: string;
  description: string;
  courseId: string;
}

interface SkillStepTarget {
  step: { id: number; name: string };
  courseId: number;
  currentSkillIds: number[];
  availableSkills: { id: number; name: string; description?: string }[];
}

const Skills: React.FC = () => {
  const { user } = useContext(AuthContext);
  const canEdit = user?.user_role !== "student";

  // --- States from Hook ---
  const [courses, setCourses] = useState<CourseWithSkills[]>([]);
  const [allSteps, setAllSteps] = useState<StepWithProject[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<SkillToEdit | null>(null);
  const [isStepAssociationModalOpen, setIsStepAssociationModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillWithSteps | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ skill: Skill; courseId: number } | null>(null);
  const [isSkillStepModalOpen, setIsSkillStepModalOpen] = useState(false);
  const [skillStepTarget, setSkillStepTarget] = useState<SkillStepTarget | null>(null);

  // --- States from Component ---
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

  // --- Fetch optimisé (3 vagues parallèles) ---
  const fetchGlobalData = async () => {
    try {
      setLoading(true);
      // Vague 1 : données de base
      const [coursesRes, stepsRes, projectsRes] = await Promise.all([
        CoursesService.getAllCourses(),
        StepsService.getAllSteps(),
        ProjectsService.getAllProjects(),
      ]);

      const projects: Project[] = projectsRes.data;
      const steps: Step[] = stepsRes.data;
      const rawCourses: Course[] = coursesRes.data;

      const enrichedSteps: StepWithProject[] = steps.map((s) => {
        const p = projects.find((proj) => proj.id === s.project_id);
        return { ...s, projectName: p ? p.name : "Inconnu" };
      });

      setAllSteps(enrichedSteps);
      setAllProjects(projects);

      // Vague 2 : compétences de tous les cours en parallèle
      const coursesSkillsRes = await Promise.all(
        rawCourses.map((course) => CoursesService.getCourseSkills(course.id).catch(() => ({ data: [] })))
      );

      // Collecter toutes les compétences uniques
      const allSkillsFlat: { skill: Skill; courseIdx: number }[] = [];
      coursesSkillsRes.forEach((res, courseIdx) => {
        const skills: Skill[] = Array.isArray(res.data) ? res.data : [];
        skills.forEach((skill) => {
          if (skill.id) allSkillsFlat.push({ skill, courseIdx });
        });
      });

      // Vague 3 : étapes liées à toutes les compétences en parallèle
      const skillStepsResults = await Promise.all(
        allSkillsFlat.map(({ skill }) =>
          StepsService.getSkillSteps(skill.id)
            .then((r) => Array.isArray(r.data) ? r.data as Step[] : [])
            .catch(() => [] as Step[])
        )
      );

      // Reconstruction des cours enrichis
      const skillsWithStepsByCourseIdx: SkillWithSteps[][] = rawCourses.map(() => []);

      allSkillsFlat.forEach(({ skill, courseIdx }, i) => {
        const linkedSteps: StepWithProject[] = skillStepsResults[i].map((s) => {
          const p = projects.find((proj) => proj.id === s.project_id);
          return { ...s, projectName: p ? p.name : "Inconnu" };
        });
        skillsWithStepsByCourseIdx[courseIdx].push({ ...skill, linkedSteps });
      });

      const coursesWithSkills: CourseWithSkills[] = rawCourses.map((course, idx) => ({
        ...course,
        skills: skillsWithStepsByCourseIdx[idx],
        skillsLoaded: true,
      }));

      setCourses(coursesWithSkills);
    } catch (err) {
      console.error("Failed to fetch skills data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchGlobalData();
  }, [user]);

  // Re-fetch d'un cours après modification
  const fetchCourseSkills = async (courseId: number) => {
    try {
      const skillsRes = await CoursesService.getCourseSkills(courseId);
      const rawSkills: Skill[] = Array.isArray(skillsRes.data) ? skillsRes.data : [];

      const skillsWithSteps = await Promise.all(
        rawSkills.map(async (skill) => {
          if (!skill.id) return { ...skill, linkedSteps: [] };
          try {
            const stepsRes = await StepsService.getSkillSteps(skill.id);
            const skillSteps: Step[] = Array.isArray(stepsRes.data) ? stepsRes.data : [];
            const enrichedSkillSteps: StepWithProject[] = skillSteps.map((s) => {
              const p = allProjects.find((proj) => proj.id === s.project_id);
              return { ...s, projectName: p ? p.name : "Inconnu" };
            });
            return { ...skill, linkedSteps: enrichedSkillSteps };
          } catch {
            return { ...skill, linkedSteps: [] };
          }
        })
      );

      setCourses((prev) =>
        prev.map((c) => c.id === courseId ? { ...c, skills: skillsWithSteps, skillsLoaded: true } : c)
      );
    } catch (err) {
      console.error(`Failed to fetch skills for course ${courseId}`, err);
    }
  };

  // --- Handlers CRUD ---

  const handleSaveNewSkill = async (skillData: any) => {
    try {
      let skillId = skillData.id;
      const courseId = Number(skillData.courseId);
      if (skillId) {
        await SkillsService.updateSkill(skillId, { name: skillData.name, description: skillData.description });
      } else {
        const res = await SkillsService.createSkill({ name: skillData.name, description: skillData.description });
        skillId = res.data.id;
        await CoursesService.linkSkillToCourse({ course_id: courseId, skill_id: skillId });
      }
      await fetchCourseSkills(courseId);
      setIsCreateModalOpen(false);
      setSkillToEdit(null);
    } catch (err) {
      console.error("Failed to save skill", err);
    }
  };

  const handleEditSkill = (skill: Skill, courseId: number) => {
    setSkillToEdit({ id: skill.id, name: skill.name, description: skill.description || "", courseId: courseId.toString() });
    setIsCreateModalOpen(true);
  };

  const handleUnlinkStep = async (stepId: number, skillId: number, courseId: number) => {
    try {
      await StepsService.unlinkSkillFromStep(stepId, skillId);
      await fetchCourseSkills(courseId);
    } catch (err) {
      console.error("Error unlinking step", err);
    }
  };

  const handleOpenStepAssociation = (skill: SkillWithSteps) => {
    setSelectedSkill(skill);
    setIsStepAssociationModalOpen(true);
  };

  const handleSaveStepAssociations = async (stepIds: number[]) => {
    if (!selectedSkill) return;
    const currentIds = selectedSkill.linkedSteps?.map((s) => s.id) || [];
    const added = stepIds.filter((id) => !currentIds.includes(id));
    const removed = currentIds.filter((id) => !stepIds.includes(id));
    try {
      await Promise.all([
        ...added.map((stepId) => StepsService.linkSkillToStep({ step_id: stepId, skill_id: selectedSkill.id })),
        ...removed.map((stepId) => StepsService.unlinkSkillFromStep(stepId, selectedSkill.id)),
      ]);
      const course = courses.find((c) => c.skills?.some((s) => s.id === selectedSkill.id));
      if (course) await fetchCourseSkills(course.id);
    } catch (err) {
      console.error("Failed to save step links", err);
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
        await fetchCourseSkills(itemToDelete.courseId);
      } catch (err) {
        console.error("Failed to delete skill", err);
      }
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleAddSkillToStep = (step: { id: number; name: string }, courseId: number) => {
    const course = courses.find((c) => c.id === courseId);
    const currentSkillIds = (course?.skills || [])
      .filter((sk) => sk.linkedSteps?.some((ls) => ls.id === step.id))
      .map((sk) => sk.id);
    const availableSkills = (course?.skills || []).map((sk) => ({
      id: sk.id, name: sk.name, description: sk.description,
    }));
    setSkillStepTarget({ step, courseId, currentSkillIds, availableSkills });
    setIsSkillStepModalOpen(true);
  };

  const handleSaveSkillStepAssociations = async (skillIds: number[]) => {
    if (!skillStepTarget) return;
    const { step, courseId, currentSkillIds } = skillStepTarget;
    const added = skillIds.filter((id) => !currentSkillIds.includes(id));
    const removed = currentSkillIds.filter((id) => !skillIds.includes(id));
    try {
      await Promise.all([
        ...added.map((skillId) => StepsService.linkSkillToStep({ step_id: step.id, skill_id: skillId })),
        ...removed.map((skillId) => StepsService.unlinkSkillFromStep(step.id, skillId)),
      ]);
      await fetchCourseSkills(courseId);
    } catch (err) {
      console.error("Failed to save skill-step associations", err);
    }
    setIsSkillStepModalOpen(false);
  };

  const handleCreateSkillForStep = async (name: string, description: string, courseId: number): Promise<number | null> => {
    try {
      const res = await SkillsService.createSkill({ name, description });
      const newId = res.data.id;
      await CoursesService.linkSkillToCourse({ course_id: courseId, skill_id: newId });
      setSkillStepTarget((prev) =>
        prev ? { ...prev, availableSkills: [...prev.availableSkills, { id: newId, name, description }] } : prev
      );
      return newId;
    } catch (err) {
      console.error("Failed to create skill for step", err);
      return null;
    }
  };

  const toggleCourse = (courseId: number) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      next.has(courseId) ? next.delete(courseId) : next.add(courseId);
      return next;
    });
  };

  const toggleProject = (projectId: number) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      next.has(projectId) ? next.delete(projectId) : next.add(projectId);
      return next;
    });
  };

  // Dérivation de la vue admin : Cours > Projet > Étape > Compétences
  const adminCourseViews = useMemo(() => {
    const filtered = courses.filter((course) => {
      const query = searchQuery.toLowerCase();
      if (!query) return true;
      if (course.name.toLowerCase().includes(query)) return true;
      return course.skills?.some(
        (sk) =>
          sk.name.toLowerCase().includes(query) ||
          (sk.description ?? "").toLowerCase().includes(query)
      );
    });

    return filtered.map((course) => {
      const courseProjects = allProjects.filter((p: any) => p.course_id === course.id);
      const adminProjects = courseProjects.map((project) => {
        const projectSteps = allSteps.filter((s) => s.project_id === project.id);
        const steps = projectSteps.map((step) => ({
          step,
          skills: (course.skills || []).filter((sk) =>
            sk.linkedSteps?.some((ls) => ls.id === step.id)
          ),
        }));
        return { project, steps };
      });
      const unassignedSkills = (course.skills || []).filter(
        (sk) => !sk.linkedSteps || sk.linkedSteps.length === 0
      );
      return { course, adminProjects, unassignedSkills };
    });
  }, [courses, allProjects, allSteps, searchQuery]);

  if (loading) return <div className="p-6 text-text-muted">Chargement...</div>;

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
        {canEdit && (
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
        )}
      </div>

      {/* Vue principale */}
      {canEdit ? (
        <div className="space-y-4">
          {adminCourseViews.length === 0 ? (
            <div className="text-center py-12 text-text-muted">Aucun cours trouvé</div>
          ) : (
            adminCourseViews.map(({ course, adminProjects, unassignedSkills }) => (
              <AdminSkillsCourseAccordion
                key={course.id}
                course={course}
                projects={adminProjects}
                unassignedSkills={unassignedSkills}
                isExpanded={expandedCourses.has(course.id)}
                expandedProjectIds={expandedProjects}
                onToggleCourse={() => toggleCourse(course.id)}
                onToggleProject={toggleProject}
                onLinkStep={handleOpenStepAssociation}
                onEdit={handleEditSkill}
                onDelete={handleOpenDeleteModal}
                onUnlinkStep={handleUnlinkStep}
                onAddSkillToStep={handleAddSkillToStep}
              />
            ))
          )}
        </div>
      ) : (
        <StudentSkillsAccordion searchQuery={searchQuery} />
      )}

      {/* Modals */}
      <SkillModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setSkillToEdit(null); }}
        onSave={handleSaveNewSkill}
        existingCourses={courses.map((c) => ({ id: c.id.toString(), name: c.name }))}
        existingSteps={[]}
        skillToEdit={skillToEdit}
      />

      <StepAssociationModal
        isOpen={isStepAssociationModalOpen}
        onClose={() => setIsStepAssociationModalOpen(false)}
        onSave={handleSaveStepAssociations}
        skillName={selectedSkill?.name || ""}
        existingProjects={allProjects.map((p) => ({ id: p.id, name: p.name }))}
        existingSteps={allSteps.map((s) => ({ id: s.id, name: s.name, projectId: s.project_id }))}
        currentStepIds={selectedSkill?.linkedSteps?.map((s) => s.id) || []}
      />

      <SkillStepAssociationModal
        isOpen={isSkillStepModalOpen}
        onClose={() => setIsSkillStepModalOpen(false)}
        stepName={skillStepTarget?.step.name || ""}
        courseId={skillStepTarget?.courseId || 0}
        availableSkills={skillStepTarget?.availableSkills || []}
        currentSkillIds={skillStepTarget?.currentSkillIds || []}
        onSave={handleSaveSkillStepAssociations}
        onCreateSkill={handleCreateSkillForStep}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.skill.name || ""}
        itemType="la compétence"
      />
    </div>
  );
};

export default Skills;

import React, { useState, useEffect, useContext } from "react";
import ProjectPageHeader from "../components/molecules/ProjectPageHeader";
import ProjectAccordionItem from "../components/organisms/ProjectAccordionItem";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import ProjectModal from "../components/organisms/ProjectModal";
import StepModal from "../components/organisms/StepModal";
import { ProjectsService } from "../_services/projects.service";
import { CoursesService } from "../_services/courses.service";
import { StepsService } from "../_services/steps.service";
import { SkillsService } from "../_services/skills.service";
import type { Project as ProjectType, Course, Step, Skill } from "../types";
import { AuthContext } from "../context/AuthContext";

// Extended types for UI
interface ProjectWithDetails extends ProjectType {
    linkedSteps: Step[];
    courseName?: string;
}

const Project: React.FC = () => {
    const { user } = useContext(AuthContext);
    const isStudent = user?.user_role === "student";
    const canEdit = !isStudent;

    const [searchQuery, setSearchQuery] = useState("");
    const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

    // Project modals
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<ProjectType | null>(null);
    const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<ProjectType | null>(null);

    // Step modals
    const [isStepModalOpen, setIsStepModalOpen] = useState(false);
    const [stepToEdit, setStepToEdit] = useState<Step | null>(null);
    const [preselectedProjectId, setPreselectedProjectId] = useState<number | null>(null);
    const [isDeleteStepModalOpen, setIsDeleteStepModalOpen] = useState(false);
    const [stepToDelete, setStepToDelete] = useState<Step | null>(null);

    // --- Fetch ---
    const fetchData = async () => {
        try {
            setLoading(true);

            let projectsData: ProjectType[];
            if (isStudent && user?.user_id && user.user_id > 0) {
                const res = await ProjectsService.getStudentProjects(user.user_id);
                projectsData = res.data;
            } else {
                const res = await ProjectsService.getAllProjects();
                projectsData = res.data;
            }

            const [coursesRes, skillsRes] = await Promise.all([
                CoursesService.getAllCourses(),
                SkillsService.getAllSkills(),
            ]);

            const coursesData: Course[] = coursesRes.data;
            const skillsData: Skill[] = skillsRes.data;

            // Enrich projects with course name and linked steps
            const enrichedProjects = await Promise.all(
                projectsData.map(async (p) => {
                    const course = coursesData.find((c) => c.id === p.course_id);
                    try {
                        const stepsRes = await StepsService.getStepsByProject(p.id);
                        return {
                            ...p,
                            courseName: course ? course.name : "Non assigné",
                            linkedSteps: stepsRes.data,
                        };
                    } catch {
                        return {
                            ...p,
                            courseName: course ? course.name : "Non assigné",
                            linkedSteps: [],
                        };
                    }
                })
            );

            setProjects(enrichedProjects);
            setCourses(coursesData);
            setSkills(skillsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user]);

    // --- Toggle accordion ---
    const toggleProject = (projectId: number) => {
        const newExpanded = new Set(expandedProjects);
        if (newExpanded.has(projectId)) {
            newExpanded.delete(projectId);
        } else {
            newExpanded.add(projectId);
        }
        setExpandedProjects(newExpanded);
    };

    // --- Project CRUD ---
    const handleSaveProject = async (projectData: any, stepData: any | null) => {
        try {
            let projectId = projectData.id;

            if (projectId) {
                await ProjectsService.updateProject(projectId, {
                    name: projectData.name,
                    description: projectData.description,
                    course_id: Number(projectData.courseId),
                });
            } else {
                const res = await ProjectsService.createProject({
                    name: projectData.name,
                    description: projectData.description,
                    course_id: Number(projectData.courseId),
                });
                projectId = res.data.id;
            }

            // Optional inline step creation (legacy ProjectModal feature)
            if (stepData && projectId && stepData.name) {
                await StepsService.createStep({
                    name: stepData.name,
                    description: stepData.description,
                    project_id: projectId,
                    step_order: 1,
                });
            }

            await fetchData();
            setIsProjectModalOpen(false);
            setProjectToEdit(null);
        } catch (error) {
            console.error("Failed to save project", error);
        }
    };

    const handleEditProject = (project: ProjectType) => {
        setProjectToEdit(project);
        setIsProjectModalOpen(true);
    };

    const handleConfirmDeleteProject = async () => {
        if (projectToDelete) {
            try {
                await ProjectsService.deleteProject(projectToDelete.id);
                await fetchData();
            } catch (error) {
                console.error("Failed to delete project", error);
            }
        }
        setIsDeleteProjectModalOpen(false);
        setProjectToDelete(null);
    };

    // --- Step CRUD ---
    const handleOpenAddStep = (project: ProjectWithDetails) => {
        setPreselectedProjectId(project.id);
        setStepToEdit(null);
        setIsStepModalOpen(true);
    };

    const handleOpenEditStep = (step: Step) => {
        setStepToEdit(step);
        setPreselectedProjectId(step.project_id);
        setIsStepModalOpen(true);
    };

    const handleSaveStep = async (stepData: any, skillData: any | null) => {
        try {
            let stepId = stepData.id;

            if (stepId) {
                await StepsService.updateStep(stepId, {
                    name: stepData.name,
                    description: stepData.description,
                    project_id: Number(stepData.projectId),
                    step_order: Number(stepData.order) || 1,
                });
            } else {
                const res = await StepsService.createStep({
                    name: stepData.name,
                    description: stepData.description,
                    project_id: Number(stepData.projectId),
                    step_order: Number(stepData.order) || 1,
                });
                stepId = res.data.id;
            }

            if (skillData && stepId) {
                if (skillData.name) {
                    const skillRes = await SkillsService.createSkill({
                        name: skillData.name,
                        description: skillData.description,
                    });
                    await StepsService.linkSkillToStep({
                        step_id: stepId,
                        skill_id: skillRes.data.id,
                    });
                } else if (skillData.id) {
                    await StepsService.linkSkillToStep({
                        step_id: stepId,
                        skill_id: Number(skillData.id),
                    });
                }
            }

            await fetchData();
            setIsStepModalOpen(false);
            setStepToEdit(null);
            setPreselectedProjectId(null);
        } catch (error) {
            console.error("Failed to save step", error);
        }
    };

    const handleConfirmDeleteStep = async () => {
        if (stepToDelete) {
            try {
                await StepsService.deleteStep(stepToDelete.id);
                await fetchData();
            } catch (error) {
                console.error("Failed to delete step", error);
            }
        }
        setIsDeleteStepModalOpen(false);
        setStepToDelete(null);
    };

    // --- Derived ---
    const filteredProjects = projects.filter(
        (project) =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.linkedSteps.some((step) =>
                step.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    // Build step list for StepModal (excluding steps already in the current project context)
    const allStepsForModal = projects.flatMap((p) =>
        p.linkedSteps.map((s) => ({ id: s.id.toString(), name: s.name }))
    );

    if (loading) return <div className="p-6">Chargement...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 text-text-main">Gestion des Projets</h1>

            <ProjectPageHeader
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                canEdit={canEdit}
                onAdd={() => {
                    setProjectToEdit(null);
                    setIsProjectModalOpen(true);
                }}
            />

            {/* Liste accordéon */}
            <div className="space-y-4">
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-12 text-text-muted">Aucun projet trouvé</div>
                ) : (
                    filteredProjects.map((project) => (
                        <ProjectAccordionItem
                            key={project.id}
                            project={project}
                            isExpanded={expandedProjects.has(project.id)}
                            canEdit={canEdit}
                            onToggle={() => toggleProject(project.id)}
                            onEdit={handleEditProject}
                            onDelete={(p) => {
                                setProjectToDelete(p);
                                setIsDeleteProjectModalOpen(true);
                            }}
                            onAddStep={handleOpenAddStep}
                            onEditStep={handleOpenEditStep}
                            onDeleteStep={(step) => {
                                setStepToDelete(step);
                                setIsDeleteStepModalOpen(true);
                            }}
                        />
                    ))
                )}
            </div>

            {/* Project modals */}
            <ProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => {
                    setIsProjectModalOpen(false);
                    setProjectToEdit(null);
                }}
                onSave={handleSaveProject}
                existingCourses={courses.map((c) => ({ id: c.id.toString(), name: c.name }))}
                existingSteps={allStepsForModal}
                initialData={projectToEdit}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteProjectModalOpen}
                onClose={() => {
                    setIsDeleteProjectModalOpen(false);
                    setProjectToDelete(null);
                }}
                onConfirm={handleConfirmDeleteProject}
                itemName={projectToDelete?.name || ""}
                itemType="le projet"
            />

            {/* Step modals */}
            <StepModal
                isOpen={isStepModalOpen}
                onClose={() => {
                    setIsStepModalOpen(false);
                    setStepToEdit(null);
                    setPreselectedProjectId(null);
                }}
                onSave={handleSaveStep}
                existingProjects={courses
                    .flatMap(() => projects)
                    .filter((v, i, a) => a.findIndex((p) => p.id === v.id) === i)
                    .map((p) => ({ id: p.id.toString(), name: p.name }))}
                existingSkills={skills.map((s) => ({ id: s.id.toString(), name: s.name }))}
                initialData={
                    stepToEdit
                        ? stepToEdit
                        : preselectedProjectId
                        ? ({ project_id: preselectedProjectId } as Partial<Step> as any)
                        : null
                }
            />

            <DeleteConfirmationModal
                isOpen={isDeleteStepModalOpen}
                onClose={() => {
                    setIsDeleteStepModalOpen(false);
                    setStepToDelete(null);
                }}
                onConfirm={handleConfirmDeleteStep}
                itemName={stepToDelete?.name || ""}
                itemType="l'étape"
            />
        </div>
    );
};

export default Project;

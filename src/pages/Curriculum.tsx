import React, { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import CurriculumNavTree from "../components/organisms/CurriculumNavTree";
import CurriculumDetailPanel from "../components/organisms/CurriculumDetailPanel";
import CourseModal from "../components/organisms/CourseModal";
import ProjectModal from "../components/organisms/ProjectModal";
import StepModal from "../components/organisms/StepModal";
import SkillModal from "../components/organisms/SkillModal";
import SkillStepAssociationModal from "../components/organisms/SkillStepAssociationModal";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import useIsMobile from "../hooks/useIsMobile";

import { CoursesService } from "../_services/courses.service";
import { ProjectsService } from "../_services/projects.service";
import { StepsService } from "../_services/steps.service";
import { SkillsService } from "../_services/skills.service";
import { ValidationsService } from "../_services/validations.service";
import type {
    Course, Project, Step, Skill, SkillWithSteps,
    CurriculumCourse, CurriculumProject, CurriculumStep,
} from "../types";

// ─── local modal-target interfaces ──────────────────────────────────────────

interface SkillToEdit {
    id?: number;
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

// ─── helpers ─────────────────────────────────────────────────────────────────

async function enrichCourses(rawCourses: Course[]): Promise<CurriculumCourse[]> {
    return Promise.all(
        rawCourses.map(async (course) => {
            let rawProjects: Project[] = [];
            try {
                const res = await ProjectsService.getProjectsByCourse(course.id);
                rawProjects = res.data;
            } catch { /* keep empty */ }

            let linkedSkills: Skill[] = [];
            try {
                const res = await CoursesService.getCourseSkills(course.id);
                linkedSkills = res.data;
            } catch { /* keep empty */ }

            const linkedProjects: CurriculumProject[] = await Promise.all(
                rawProjects.map(async (project) => {
                    let rawSteps: Step[] = [];
                    try {
                        const res = await StepsService.getStepsByProject(project.id);
                        rawSteps = res.data;
                    } catch { /* keep empty */ }

                    const linkedSteps: CurriculumStep[] = await Promise.all(
                        rawSteps.map(async (step) => {
                            let skills: SkillWithSteps[] = [];
                            try {
                                const res = await StepsService.getStepSkills(step.id);
                                skills = res.data;
                            } catch { /* keep empty */ }
                            return { ...step, skills };
                        })
                    );

                    return { ...project, linkedSteps };
                })
            );

            return { ...course, linkedProjects, linkedSkills };
        })
    );
}

// ─── component ───────────────────────────────────────────────────────────────

const Curriculum: React.FC = () => {
    const authContext = useContext(AuthContext);
    if (!authContext) return null;
    const { user } = authContext;
    const isAdmin = user?.user_role === "admin";
    const canEdit = user?.user_role !== "student";

    // ── data ─────────────────────────────────────────────────────────────────
    const isMobile = useIsMobile();

    // ── data ─────────────────────────────────────────────────────────────────
    const [courses, setCourses] = useState<CurriculumCourse[]>([]);
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [validations, setValidations] = useState<Record<number, { status: string; comment?: string; validated_at?: string }>>({}); 

    // ── UI selection state ────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [expandedCourseIds, setExpandedCourseIds] = useState<Set<number>>(new Set());
    const [expandedStepIds, setExpandedStepIds] = useState<Set<number>>(new Set());

    // ── modal: course ─────────────────────────────────────────────────────────
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState<CurriculumCourse | null>(null);
    const [isDeleteCourseModalOpen, setIsDeleteCourseModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<CurriculumCourse | null>(null);

    // ── modal: project ────────────────────────────────────────────────────────
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [preselectedCourseId, setPreselectedCourseId] = useState<number | null>(null);
    const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<CurriculumProject | null>(null);

    // ── modal: step ───────────────────────────────────────────────────────────
    const [isStepModalOpen, setIsStepModalOpen] = useState(false);
    const [stepToEdit, setStepToEdit] = useState<Step | null>(null);
    const [preselectedProjectId, setPreselectedProjectId] = useState<number | null>(null);
    const [isDeleteStepModalOpen, setIsDeleteStepModalOpen] = useState(false);
    const [stepToDelete, setStepToDelete] = useState<CurriculumStep | null>(null);

    // ── modal: skill ──────────────────────────────────────────────────────────
    const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
    const [skillToEdit, setSkillToEdit] = useState<SkillToEdit | null>(null);
    const [skillModalCourseId, setSkillModalCourseId] = useState<number | null>(null);
    const [isDeleteSkillModalOpen, setIsDeleteSkillModalOpen] = useState(false);
    const [skillToDelete, setSkillToDelete] = useState<{ skill: Skill; courseId: number } | null>(null);

    // ── modal: link skill ↔ step ──────────────────────────────────────────────
    const [isSkillStepModalOpen, setIsSkillStepModalOpen] = useState(false);
    const [skillStepTarget, setSkillStepTarget] = useState<SkillStepTarget | null>(null);

    // ─────────────────────────────────────────────────────────────────────────
    // Fetch
    // ─────────────────────────────────────────────────────────────────────────

    const fetchAll = async () => {
        if (!user) return;
        try {
            setLoading(true);
            let rawCourses: Course[];
            if (isAdmin) {
                const res = await CoursesService.getAllCourses();
                rawCourses = res.data;
            } else {
                const res = await CoursesService.getUserCourses(user.user_id);
                rawCourses = res.data;
            }

            // Fetch student validations if applicable
            let valMap: Record<number, { status: string; comment?: string; validated_at?: string }> = {};
            if (user.user_role === "student") {
                try {
                    const valRes = await ValidationsService.getUserValidations(user.user_id);
                    const vals = Array.isArray(valRes.data) ? valRes.data : [];
                    vals.forEach((v: any) => {
                        valMap[v.skill_id] = {
                            status: v.status,
                            comment: v.comment,
                            validated_at: v.validated_at,
                        };
                    });
                } catch (valErr) {
                    console.error("Failed to load student validations", valErr);
                }
            }

            const [enriched, skillsRes] = await Promise.all([
                enrichCourses(rawCourses),
                SkillsService.getAllSkills(),
            ]);

            setCourses(enriched);
            setAllSkills(skillsRes.data);
            setValidations(valMap);
        } catch (err) {
            console.error("Failed to fetch curriculum data", err);
        } finally {
            setLoading(false);
        }
    };

    const refreshCourse = async (courseId: number) => {
        try {
            const rawRes = await CoursesService.getCourseById(courseId);
            const [refreshed] = await enrichCourses([rawRes.data]);
            setCourses((prev) => prev.map((c) => (c.id === courseId ? refreshed : c)));
        } catch (err) {
            console.error("Failed to refresh course", err);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [user]);

    // ─────────────────────────────────────────────────────────────────────────
    // Selection & toggle helpers
    // ─────────────────────────────────────────────────────────────────────────

    const handleSelectCourse = (courseId: number) => {
        setSelectedCourseId(courseId);
        setSelectedProjectId(null);
    };

    const handleSelectProject = (courseId: number, projectId: number) => {
        setSelectedCourseId(courseId);
        setSelectedProjectId(projectId);
    };

    const handleToggleCourse = (courseId: number) =>
        setExpandedCourseIds((prev) => {
            const next = new Set(prev);
            next.has(courseId) ? next.delete(courseId) : next.add(courseId);
            return next;
        });

    const handleToggleStep = (stepId: number) =>
        setExpandedStepIds((prev) => {
            const next = new Set(prev);
            next.has(stepId) ? next.delete(stepId) : next.add(stepId);
            return next;
        });

    // ─────────────────────────────────────────────────────────────────────────
    // Course handlers
    // ─────────────────────────────────────────────────────────────────────────

    const handleSaveCourse = async (data: any) => {
        try {
            if (data.id) {
                await CoursesService.updateCourse(data.id, { name: data.name, description: data.description });
            } else {
                await CoursesService.createCourse({ name: data.name, description: data.description });
            }
            await fetchAll();
        } catch (err) { console.error(err); }
        setIsCourseModalOpen(false);
        setCourseToEdit(null);
    };

    const handleConfirmDeleteCourse = async () => {
        if (!courseToDelete) return;
        try {
            await CoursesService.deleteCourse(courseToDelete.id);
            if (selectedCourseId === courseToDelete.id) {
                setSelectedCourseId(null);
                setSelectedProjectId(null);
            }
            await fetchAll();
        } catch (err) { console.error(err); }
        setIsDeleteCourseModalOpen(false);
        setCourseToDelete(null);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Project handlers
    // ─────────────────────────────────────────────────────────────────────────

    const handleSaveProject = async (projectData: any) => {
        try {
            const courseId = Number(projectData.courseId) || preselectedCourseId;
            if (projectData.id) {
                await ProjectsService.updateProject(projectData.id, {
                    name: projectData.name,
                    description: projectData.description,
                    course_id: courseId,
                });
            } else {
                await ProjectsService.createProject({
                    name: projectData.name,
                    description: projectData.description,
                    course_id: courseId,
                });
            }
            if (courseId) await refreshCourse(courseId);
            else await fetchAll();
        } catch (err) { console.error(err); }
        setIsProjectModalOpen(false);
        setProjectToEdit(null);
        setPreselectedCourseId(null);
    };

    const handleConfirmDeleteProject = async () => {
        if (!projectToDelete) return;
        try {
            await ProjectsService.deleteProject(projectToDelete.id);
            if (selectedProjectId === projectToDelete.id) setSelectedProjectId(null);
            const parent = courses.find((c) => c.linkedProjects.some((p) => p.id === projectToDelete.id));
            if (parent) await refreshCourse(parent.id);
            else await fetchAll();
        } catch (err) { console.error(err); }
        setIsDeleteProjectModalOpen(false);
        setProjectToDelete(null);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Step handlers
    // ─────────────────────────────────────────────────────────────────────────

    const handleSaveStep = async (stepData: any) => {
        try {
            const projectId = Number(stepData.projectId) || preselectedProjectId;
            if (stepData.id) {
                await StepsService.updateStep(stepData.id, {
                    name: stepData.name,
                    description: stepData.description,
                    project_id: projectId,
                    step_order: Number(stepData.order) || 1,
                });
            } else {
                await StepsService.createStep({
                    name: stepData.name,
                    description: stepData.description,
                    project_id: projectId,
                    step_order: Number(stepData.order) || 1,
                });
            }
            const parent = courses.find((c) =>
                c.linkedProjects.some((p) => p.id === (projectId ?? preselectedProjectId))
            );
            if (parent) await refreshCourse(parent.id);
            else await fetchAll();
        } catch (err) { console.error(err); }
        setIsStepModalOpen(false);
        setStepToEdit(null);
        setPreselectedProjectId(null);
    };

    const handleConfirmDeleteStep = async () => {
        if (!stepToDelete) return;
        try {
            await StepsService.deleteStep(stepToDelete.id);
            const parent = courses.find((c) =>
                c.linkedProjects.some((p) => p.linkedSteps.some((s) => s.id === stepToDelete.id))
            );
            if (parent) await refreshCourse(parent.id);
            else await fetchAll();
        } catch (err) { console.error(err); }
        setIsDeleteStepModalOpen(false);
        setStepToDelete(null);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Skill handlers
    // ─────────────────────────────────────────────────────────────────────────

    const handleSaveSkill = async (skillData: any) => {
        try {
            const courseId = Number(skillData.courseId);
            let skillId = skillData.id;
            if (skillId) {
                await SkillsService.updateSkill(skillId, { name: skillData.name, description: skillData.description });
            } else {
                const res = await SkillsService.createSkill({ name: skillData.name, description: skillData.description });
                skillId = res.data.id;
                await CoursesService.linkSkillToCourse({ course_id: courseId, skill_id: skillId });
            }
            await refreshCourse(courseId);
            const allRes = await SkillsService.getAllSkills();
            setAllSkills(allRes.data);
        } catch (err) { console.error(err); }
        setIsSkillModalOpen(false);
        setSkillToEdit(null);
        setSkillModalCourseId(null);
    };

    const handleAssociateSkillsToCourse = async (skillIds: number[], courseId: number) => {
        const course = courses.find((c) => c.id === courseId);
        const currentSkillIds = (course?.linkedSkills ?? []).map((s) => s.id);
        const added = skillIds.filter((id) => !currentSkillIds.includes(id));
        const removed = currentSkillIds.filter((id) => !skillIds.includes(id));
        try {
            await Promise.all([
                ...added.map((id) => CoursesService.linkSkillToCourse({ course_id: courseId, skill_id: id })),
                ...removed.map((id) => CoursesService.unlinkSkillFromCourse(courseId, id)),
            ]);
            await refreshCourse(courseId);
            const allRes = await SkillsService.getAllSkills();
            setAllSkills(allRes.data);
        } catch (err) { console.error(err); }
        setIsSkillModalOpen(false);
        setSkillToEdit(null);
        setSkillModalCourseId(null);
    };

    const handleCreateSkillForCourse = async (name: string, description: string, _courseId: number): Promise<number | null> => {
        try {
            const res = await SkillsService.createSkill({ name, description });
            const newId = res.data.id;
            const allRes = await SkillsService.getAllSkills();
            setAllSkills(allRes.data);
            return newId;
        } catch (err) {
            console.error("Failed to create skill for course", err);
            return null;
        }
    };

    const handleConfirmDeleteSkill = async () => {
        if (!skillToDelete) return;
        try {
            await SkillsService.deleteSkill(skillToDelete.skill.id);
            await refreshCourse(skillToDelete.courseId);
            const allRes = await SkillsService.getAllSkills();
            setAllSkills(allRes.data);
        } catch (err) { console.error(err); }
        setIsDeleteSkillModalOpen(false);
        setSkillToDelete(null);
    };

    const handleUnlinkSkillFromStep = async (stepId: number, skillId: number, courseId: number) => {
        try {
            await StepsService.unlinkSkillFromStep(stepId, skillId);
            await refreshCourse(courseId);
        } catch (err) { console.error(err); }
    };

    const handleUnlinkSkillFromCourse = async (courseId: number, skillId: number) => {
        try {
            await CoursesService.unlinkSkillFromCourse(courseId, skillId);
            await refreshCourse(courseId);
        } catch (err) { console.error(err); }
    };

    const handleOpenSkillStepModal = (step: CurriculumStep, courseId: number) => {
        const course = courses.find((c) => c.id === courseId);
        const currentSkillIds = step.skills.map((sk) => sk.id);
        const availableSkills = course?.linkedSkills ?? [];
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
            await refreshCourse(courseId);
        } catch (err) { console.error(err); }
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
        } catch (err) { console.error(err); return null; }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Derived selections
    // ─────────────────────────────────────────────────────────────────────────

    const selectedCourse = useMemo(
        () => courses.find((c) => c.id === selectedCourseId) ?? null,
        [courses, selectedCourseId]
    );

    const selectedProject = useMemo(
        () => selectedCourse?.linkedProjects.find((p) => p.id === selectedProjectId) ?? null,
        [selectedCourse, selectedProjectId]
    );

    // ── Mobile back handler ──────────────────────────────────────────────────
    const handleMobileBack = () => {
        setSelectedCourseId(null);
        setSelectedProjectId(null);
    };

    // On mobile, show NavTree when nothing is selected, DetailPanel otherwise
    const showNavTree = isMobile ? selectedCourseId === null : true;
    const showDetailPanel = isMobile ? selectedCourseId !== null : true;


    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    if (loading) return <div className="p-6 text-text-muted">Chargement...</div>;

    return (
        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
            {/* Left panel — navigation tree (full width on mobile, 1/3 on desktop) */}
            {showNavTree && (
                <div className="w-full lg:w-1/3 flex-shrink-0 h-full">
                    <CurriculumNavTree
                        courses={courses}
                        selectedCourseId={selectedCourseId}
                        selectedProjectId={selectedProjectId}
                        expandedCourseIds={expandedCourseIds}
                        canEdit={canEdit}
                        isAdmin={isAdmin}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onSelectCourse={handleSelectCourse}
                        onSelectProject={handleSelectProject}
                        onToggleCourse={handleToggleCourse}
                        onAddCourse={() => { setCourseToEdit(null); setIsCourseModalOpen(true); }}
                        onEditCourse={(c) => { setCourseToEdit(c); setIsCourseModalOpen(true); }}
                        onDeleteCourse={(c) => { setCourseToDelete(c); setIsDeleteCourseModalOpen(true); }}
                        onAddProject={(c) => { setPreselectedCourseId(c.id); setProjectToEdit(null); setIsProjectModalOpen(true); }}
                        onEditProject={(p) => { setProjectToEdit(p); setIsProjectModalOpen(true); }}
                        onDeleteProject={(p) => { setProjectToDelete(p); setIsDeleteProjectModalOpen(true); }}
                    />
                </div>
            )}

            {/* Right panel — detail view (full width on mobile, flex-1 on desktop) */}
            {showDetailPanel && (
                <div className="flex-1 overflow-y-auto">
                    <CurriculumDetailPanel
                        selectedCourse={selectedCourse}
                        selectedProject={selectedProject}
                        canEdit={canEdit}
                        validations={user?.user_role === "student" ? validations : undefined}
                        expandedStepIds={expandedStepIds}
                        onToggleStep={handleToggleStep}
                        onBack={isMobile ? handleMobileBack : undefined}
                        onAddProject={(c) => { setPreselectedCourseId(c.id); setProjectToEdit(null); setIsProjectModalOpen(true); }}
                        onSelectProject={handleSelectProject}
                        onAddStep={(p) => { setPreselectedProjectId(p.id); setStepToEdit(null); setIsStepModalOpen(true); }}
                        onEditStep={(s) => { setStepToEdit(s); setPreselectedProjectId(s.project_id); setIsStepModalOpen(true); }}
                        onDeleteStep={(s) => { setStepToDelete(s); setIsDeleteStepModalOpen(true); }}
                        onAddSkillToStep={handleOpenSkillStepModal}
                        onEditSkill={(sk, cId) => {
                            setSkillToEdit({ id: sk.id, name: sk.name, description: sk.description ?? "", courseId: cId.toString() });
                            setSkillModalCourseId(cId);
                            setIsSkillModalOpen(true);
                        }}
                        onDeleteSkill={(sk, cId) => { setSkillToDelete({ skill: sk, courseId: cId }); setIsDeleteSkillModalOpen(true); }}
                        onUnlinkSkillFromStep={handleUnlinkSkillFromStep}
                        onAddSkillToCourse={(c) => {
                            setSkillToEdit(null);
                            setSkillModalCourseId(c.id);
                            setIsSkillModalOpen(true);
                        }}
                        onUnlinkSkillFromCourse={handleUnlinkSkillFromCourse}
                    />
                </div>
            )}

            {/* ── Modals ── */}

            <CourseModal
                isOpen={isCourseModalOpen}
                onClose={() => { setIsCourseModalOpen(false); setCourseToEdit(null); }}
                onSave={handleSaveCourse}
                courseToEdit={courseToEdit ? { ...courseToEdit, description: courseToEdit.description ?? "" } : null}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteCourseModalOpen}
                onClose={() => { setIsDeleteCourseModalOpen(false); setCourseToDelete(null); }}
                onConfirm={handleConfirmDeleteCourse}
                itemName={courseToDelete?.name ?? ""}
                itemType="le cours"
            />

            <ProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => { setIsProjectModalOpen(false); setProjectToEdit(null); setPreselectedCourseId(null); }}
                onSave={handleSaveProject}
                initialData={projectToEdit
                    ? projectToEdit
                    : preselectedCourseId
                    ? ({ course_id: preselectedCourseId } as any)
                    : null}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteProjectModalOpen}
                onClose={() => { setIsDeleteProjectModalOpen(false); setProjectToDelete(null); }}
                onConfirm={handleConfirmDeleteProject}
                itemName={projectToDelete?.name ?? ""}
                itemType="le projet"
            />

            <StepModal
                isOpen={isStepModalOpen}
                onClose={() => { setIsStepModalOpen(false); setStepToEdit(null); setPreselectedProjectId(null); }}
                onSave={handleSaveStep}
                initialData={stepToEdit
                    ? stepToEdit
                    : preselectedProjectId
                    ? ({ project_id: preselectedProjectId } as any)
                    : null}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteStepModalOpen}
                onClose={() => { setIsDeleteStepModalOpen(false); setStepToDelete(null); }}
                onConfirm={handleConfirmDeleteStep}
                itemName={stepToDelete?.name ?? ""}
                itemType="l'étape"
            />

            <SkillModal
                isOpen={isSkillModalOpen}
                onClose={() => { setIsSkillModalOpen(false); setSkillToEdit(null); setSkillModalCourseId(null); }}
                onSave={handleSaveSkill}
                onAssociate={(skillIds) => handleAssociateSkillsToCourse(skillIds, skillModalCourseId!)}
                onCreateSkill={handleCreateSkillForCourse}
                availableSkills={allSkills}
                currentSkillIds={selectedCourse ? (selectedCourse.linkedSkills ?? []).map((s) => s.id) : []}
                courseId={skillModalCourseId}
                courseName={selectedCourse?.name}
                skillToEdit={skillToEdit}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteSkillModalOpen}
                onClose={() => { setIsDeleteSkillModalOpen(false); setSkillToDelete(null); }}
                onConfirm={handleConfirmDeleteSkill}
                itemName={skillToDelete?.skill.name ?? ""}
                itemType="la compétence"
            />

            <SkillStepAssociationModal
                isOpen={isSkillStepModalOpen}
                onClose={() => setIsSkillStepModalOpen(false)}
                stepName={skillStepTarget?.step.name ?? ""}
                courseId={skillStepTarget?.courseId ?? 0}
                availableSkills={skillStepTarget?.availableSkills ?? []}
                currentSkillIds={skillStepTarget?.currentSkillIds ?? []}
                onSave={handleSaveSkillStepAssociations}
                onCreateSkill={handleCreateSkillForStep}
            />
        </div>
    );
};

export default Curriculum;

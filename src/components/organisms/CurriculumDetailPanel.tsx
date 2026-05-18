import React from "react";
import { useNavigate } from "react-router-dom";
import CurriculumStepSection from "./CurriculumStepSection";
import Button from "../atoms/Buttons/Button";
import type {
    CurriculumCourse, CurriculumProject, CurriculumStep,
    SkillWithSteps, Skill,
} from "../../types";

interface CurriculumDetailPanelProps {
    selectedCourse: CurriculumCourse | null;
    selectedProject: CurriculumProject | null;
    canEdit: boolean;
    expandedStepIds: Set<number>;
    onToggleStep: (stepId: number) => void;
    // Course-level actions
    onAddProject: (course: CurriculumCourse) => void;
    onSelectProject: (courseId: number, projectId: number) => void;
    // Project-level actions
    onAddStep: (project: CurriculumProject) => void;
    onEditStep: (step: CurriculumStep) => void;
    onDeleteStep: (step: CurriculumStep) => void;
    onAddSkillToStep: (step: CurriculumStep, courseId: number) => void;
    onEditSkill: (skill: SkillWithSteps, courseId: number) => void;
    onDeleteSkill: (skill: Skill, courseId: number) => void;
    onUnlinkSkillFromStep: (stepId: number, skillId: number, courseId: number) => void;
    onLinkExistingSkill: (skill: SkillWithSteps) => void;
}

const CurriculumDetailPanel: React.FC<CurriculumDetailPanelProps> = ({
    selectedCourse,
    selectedProject,
    canEdit,
    expandedStepIds,
    onToggleStep,
    onAddProject,
    onSelectProject,
    onAddStep,
    onEditStep,
    onDeleteStep,
    onAddSkillToStep,
    onEditSkill,
    onDeleteSkill,
    onUnlinkSkillFromStep,
    onLinkExistingSkill,
}) => {
    const navigate = useNavigate();

    const handleValidateSkill = (skill: SkillWithSteps) => {
        navigate("/project-skills-validation", {
            state: {
                preselectedCourseId: selectedCourse?.id,
                preselectedProjectId: selectedProject?.id,
                preselectedSkillId: skill.id,
            },
        });
    };

    // ── 1. Nothing selected ────────────────────────────────────────────────────
    if (!selectedCourse) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-text-muted gap-4 select-none">
                <svg className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-sm font-medium">Sélectionnez un cours dans le panneau de gauche</p>
            </div>
        );
    }

    // ── 2. Course selected, no project ────────────────────────────────────────
    if (!selectedProject) {
        return (
            <div className="p-8 h-full overflow-y-auto">
                {/* Course header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-text-main">{selectedCourse.name}</h2>
                    {selectedCourse.description && (
                        <p className="mt-2 text-text-muted">{selectedCourse.description}</p>
                    )}
                </div>

                {/* Projects list */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-text-main">Projets</h3>
                        {canEdit && (
                            <Button onClick={() => onAddProject(selectedCourse)}>
                                + Ajouter un projet
                            </Button>
                        )}
                    </div>

                    {selectedCourse.linkedProjects.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-12 text-center text-text-muted">
                            {canEdit
                                ? "Aucun projet — cliquez sur « Ajouter un projet »"
                                : "Aucun projet pour ce cours."}
                        </div>
                    ) : (
                        selectedCourse.linkedProjects.map((project) => (
                            <button
                                key={project.id}
                                type="button"
                                onClick={() => onSelectProject(selectedCourse.id, project.id)}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-surface hover:border-primary hover:bg-primary/5 transition-all text-left group"
                            >
                                {/* Cube icon */}
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-text-main group-hover:text-primary transition-colors">
                                        {project.name}
                                    </p>
                                    {project.description && (
                                        <p className="text-sm text-text-muted truncate mt-0.5">{project.description}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                                        {project.linkedSteps.length} étape{project.linkedSteps.length !== 1 ? "s" : ""}
                                    </span>
                                    <svg className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // ── 3. Project selected ────────────────────────────────────────────────────
    const sortedSteps = selectedProject.linkedSteps
        .slice()
        .sort((a, b) => a.step_order - b.step_order);

    const courseId = selectedCourse.id;

    return (
        <div className="p-8 h-full overflow-y-auto">
            {/* Project header */}
            <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                    <p className="text-sm text-text-muted mb-1">{selectedCourse.name}</p>
                    <h2 className="text-3xl font-bold text-text-main">{selectedProject.name}</h2>
                    {selectedProject.description && (
                        <p className="mt-2 text-text-muted">{selectedProject.description}</p>
                    )}
                </div>
                {canEdit && (
                    <Button
                        className="flex-shrink-0"
                        onClick={() => onAddStep(selectedProject)}
                    >
                        + Ajouter une étape
                    </Button>
                )}
            </div>

            {/* Steps + skills */}
            {sortedSteps.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-12 text-center text-text-muted">
                    {canEdit
                        ? "Aucune étape — cliquez sur « Ajouter une étape »"
                        : "Aucune étape pour ce projet."}
                </div>
            ) : (
                <div className="relative space-y-3">
                    {/* Timeline line */}
                    <div className="absolute left-[22px] top-6 bottom-6 w-px bg-border" aria-hidden="true" />

                    {sortedSteps.map((step) => {
                        const isExpanded = expandedStepIds.has(step.id);
                        return (
                            <div key={step.id} className="relative pl-12">
                                {/* Timeline dot */}
                                <div className="absolute left-[16px] top-5 h-3 w-3 rounded-full bg-border border-2 border-surface" />

                                {/* Step card */}
                                <div className="rounded-xl border border-border bg-surface overflow-hidden">
                                    {/* Step header (clickable to expand) */}
                                    <button
                                        type="button"
                                        onClick={() => onToggleStep(step.id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-text-muted min-w-[24px]">
                                                #{step.step_order || "–"}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-text-main">{step.name}</p>
                                                <p className="text-xs text-text-muted mt-0.5">
                                                    {step.skills.length} compétence{step.skills.length !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <svg
                                            className={`h-4 w-4 text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Expanded: step detail + skills */}
                                    {isExpanded && (
                                        <div className="border-t border-border p-3">
                                            <CurriculumStepSection
                                                step={step}
                                                courseId={courseId}
                                                canEdit={canEdit}
                                                onEditStep={onEditStep}
                                                onDeleteStep={onDeleteStep}
                                                onAddSkillToStep={onAddSkillToStep}
                                                onEditSkill={onEditSkill}
                                                onDeleteSkill={onDeleteSkill}
                                                onUnlinkSkillFromStep={onUnlinkSkillFromStep}
                                                onLinkExistingSkill={onLinkExistingSkill}
                                                onValidateSkill={canEdit ? handleValidateSkill : undefined}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CurriculumDetailPanel;

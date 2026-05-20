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
    validations?: Record<number, { status: string; comment?: string; validated_at?: string }>;
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
    onAddSkillToCourse: (course: CurriculumCourse) => void;
    onUnlinkSkillFromCourse: (courseId: number, skillId: number) => void;
}

const CurriculumDetailPanel: React.FC<CurriculumDetailPanelProps> = ({
    selectedCourse,
    selectedProject,
    canEdit,
    validations,
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
    onAddSkillToCourse,
    onUnlinkSkillFromCourse,
}) => {
    const navigate = useNavigate();

    const handleValidateSkill = (skill: SkillWithSteps, stepId: number) => {
        navigate("/project-skills-validation", {
            state: {
                preselectedCourseId: selectedCourse?.id,
                preselectedProjectId: selectedProject?.id,
                preselectedSkillId: skill.id,
                preselectedStepId: stepId,
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

                {/* Skills list */}
                <div className="mt-8 space-y-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-text-main">Compétences du cours</h3>
                        {canEdit && (
                            <Button onClick={() => onAddSkillToCourse(selectedCourse)}>
                                + Ajouter une compétence
                            </Button>
                        )}
                    </div>

                    {(selectedCourse.linkedSkills || []).length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-12 text-center text-text-muted">
                            {canEdit
                                ? "Aucune compétence — cliquez sur « Ajouter une compétence »"
                                : "Aucune compétence pour ce cours."}
                        </div>
                    ) : (
                        (selectedCourse.linkedSkills || []).map((skill) => (
                            <div
                                key={skill.id}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-surface hover:border-primary hover:bg-primary/5 transition-all text-left group"
                            >
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-text-main group-hover:text-primary transition-colors">
                                        {skill.name}
                                    </p>
                                    {skill.description && (
                                        <p className="text-sm text-text-muted truncate mt-0.5">{skill.description}</p>
                                    )}
                                </div>
                                {canEdit && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={() => onEditSkill(skill as any, selectedCourse.id)}
                                            className="p-2 text-text-muted hover:text-text-main hover:bg-background border border-transparent hover:border-border rounded-full transition-colors"
                                            title="Modifier la compétence"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onUnlinkSkillFromCourse(selectedCourse.id, skill.id)}
                                            className="p-2 text-text-muted hover:text-danger-text hover:bg-danger-bg border border-transparent hover:border-danger-border rounded-full transition-colors"
                                            title="Délier du cours"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteSkill(skill, selectedCourse.id)}
                                            className="p-2 text-danger-text hover:bg-danger-bg border border-transparent hover:border-danger-border rounded-full transition-colors"
                                            title="Supprimer la compétence"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
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

            <h3 className="text-lg font-semibold text-text-main mb-4">Étapes du projet</h3>

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
                        const isStepValidated = !!validations && step.skills.length > 0 && step.skills.every(
                            (s) => validations[s.id]?.status === "validated"
                        );

                        return (
                            <div key={step.id} className="relative pl-12">
                                {/* Timeline dot */}
                                <div className={`absolute left-[16px] top-5 h-3 w-3 rounded-full border-2 border-surface transition-colors ${isExpanded ? "bg-primary" : "bg-border"} ${isStepValidated ? "bg-emerald-500 border-emerald-500/20" : ""}`} />

                                {/* Step card */}
                                <div className={`rounded-xl border bg-surface overflow-hidden transition-colors ${isExpanded ? "border-primary/40" : "border-border"} ${isStepValidated ? "border-emerald-500/20 bg-emerald-500/5" : ""}`}>
                                    {/* Step header */}
                                    <div className="flex items-center gap-2 p-4">
                                        {/* Toggle zone — clic pour déployer */}
                                        <button
                                            type="button"
                                            onClick={() => onToggleStep(step.id)}
                                            className="flex-1 flex items-center gap-3 text-left min-w-0 hover:opacity-80 transition-opacity"
                                        >
                                            <span className="text-sm font-bold text-text-muted min-w-[28px] flex-shrink-0">
                                                #{step.step_order || "–"}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-semibold text-text-main">{step.name}</p>
                                                    {isStepValidated && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                            Validée
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-text-muted mt-0.5">
                                                    {step.skills.length} compétence{step.skills.length !== 1 ? "s" : ""}
                                                    {step.description && (
                                                        <span className="ml-2 opacity-70">· {step.description.length > 60 ? step.description.slice(0, 60) + "…" : step.description}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </button>

                                        {/* Action buttons — stoppent la propagation */}
                                        {canEdit && (
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); onAddSkillToStep(step, courseId); }}
                                                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-white border border-primary/30 rounded-full transition-colors"
                                                    title="Ajouter une compétence"
                                                >
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Compétence
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); onEditStep(step); }}
                                                    className="p-1.5 text-text-muted hover:text-text-main hover:bg-background border border-transparent hover:border-border rounded-full transition-colors"
                                                    title="Modifier l'étape"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); onDeleteStep(step); }}
                                                    className="p-1.5 text-danger-text hover:bg-danger-bg border border-transparent hover:border-danger-border rounded-full transition-colors"
                                                    title="Supprimer l'étape"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}

                                        {/* Chevron */}
                                        <button
                                            type="button"
                                            onClick={() => onToggleStep(step.id)}
                                            className="p-1 flex-shrink-0"
                                            aria-label={isExpanded ? "Réduire" : "Déployer"}
                                        >
                                            <svg
                                                className={`h-4 w-4 text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Expanded: skills list */}
                                    {isExpanded && (
                                        <div className="border-t border-border px-4 py-3">
                                            <CurriculumStepSection
                                                step={step}
                                                courseId={courseId}
                                                canEdit={canEdit}
                                                validations={validations}
                                                onEditSkill={onEditSkill}
                                                onDeleteSkill={onDeleteSkill}
                                                onUnlinkSkillFromStep={onUnlinkSkillFromStep}
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

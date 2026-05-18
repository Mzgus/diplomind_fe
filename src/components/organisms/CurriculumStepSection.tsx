import React from "react";
import type { CurriculumStep, SkillWithSteps, Skill } from "../../types";

interface CurriculumStepSectionProps {
    step: CurriculumStep;
    courseId: number;
    canEdit: boolean;
    onEditStep: (step: CurriculumStep) => void;
    onDeleteStep: (step: CurriculumStep) => void;
    onAddSkillToStep: (step: CurriculumStep, courseId: number) => void;
    onEditSkill: (skill: SkillWithSteps, courseId: number) => void;
    onDeleteSkill: (skill: Skill, courseId: number) => void;
    onUnlinkSkillFromStep: (stepId: number, skillId: number, courseId: number) => void;
    onLinkExistingSkill: (skill: SkillWithSteps) => void;
    onValidateSkill?: (skill: SkillWithSteps) => void;
}

const CurriculumStepSection: React.FC<CurriculumStepSectionProps> = ({
    step,
    courseId,
    canEdit,
    onEditStep,
    onDeleteStep,
    onAddSkillToStep,
    onEditSkill,
    onDeleteSkill,
    onUnlinkSkillFromStep,
    onLinkExistingSkill,
    onValidateSkill,
}) => {
    return (
        <div className="rounded-lg border border-border bg-background overflow-hidden">
            {/* Step header */}
            <div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-border">
                <div className="flex items-center gap-2">
                    {/* Step icon */}
                    <svg className="h-4 w-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm font-bold text-text-main">{step.name}</span>
                    {step.step_order > 0 && (
                        <span className="px-1.5 py-0.5 bg-background border border-border text-text-muted rounded text-xs">
                            #{step.step_order}
                        </span>
                    )}
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20">
                        {step.skills.length} compétence{step.skills.length !== 1 ? "s" : ""}
                    </span>
                </div>
                {canEdit && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onAddSkillToStep(step, courseId)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-white border border-primary/30 rounded-full transition-colors"
                            title="Ajouter une compétence"
                            type="button"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Compétence
                        </button>
                        <button
                            onClick={() => onEditStep(step)}
                            className="p-1.5 text-text-muted hover:text-text-main hover:bg-background border border-transparent hover:border-border rounded-full transition-colors"
                            title="Modifier l'étape"
                            type="button"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onDeleteStep(step)}
                            className="p-1.5 text-danger-text hover:bg-danger-bg border border-transparent hover:border-danger-border rounded-full transition-colors"
                            title="Supprimer l'étape"
                            type="button"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Description */}
            {step.description && (
                <p className="px-3 pt-2 text-xs text-text-muted italic">{step.description}</p>
            )}

            {/* Skills list */}
            <div className="px-3 py-1">
                {step.skills.length === 0 ? (
                    <p className="text-xs text-text-muted italic py-2 text-center">
                        {canEdit ? "Aucune compétence — cliquez sur « Compétence »" : "Aucune compétence associée"}
                    </p>
                ) : (
                    <div className="divide-y divide-border/50">
                        {step.skills.map((skill) => (
                            <div key={skill.id} className="flex items-center justify-between gap-4 py-2 group">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-text-main text-sm">{skill.name}</span>
                                        {canEdit && (
                                            <button
                                                onClick={() => onUnlinkSkillFromStep(step.id, skill.id, courseId)}
                                                className="p-0.5 text-text-muted hover:text-danger-text transition-colors opacity-0 group-hover:opacity-100"
                                                title="Délier de cette étape"
                                                type="button"
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    {skill.description && (
                                        <p className="text-xs text-text-muted mt-0.5 truncate">{skill.description}</p>
                                    )}
                                </div>

                                <div className="flex gap-1 flex-shrink-0 items-center">
                                    {/* Bouton Valider — visible pour les admins/teachers */}
                                    {canEdit && onValidateSkill && (
                                        <button
                                            onClick={() => onValidateSkill(skill)}
                                            className="px-3 py-1 bg-primary text-white rounded-full text-xs font-semibold hover:bg-primary-hover transition-colors"
                                            title="Valider la compétence"
                                            type="button"
                                        >
                                            Valider
                                        </button>
                                    )}
                                    {canEdit && (
                                        <>
                                            <button
                                                onClick={() => onLinkExistingSkill(skill)}
                                                className="px-2 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-full text-xs font-medium transition-colors flex items-center gap-1 border border-primary/30"
                                                title="Lier à une étape"
                                                type="button"
                                            >
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                Étape
                                            </button>
                                            <button
                                                onClick={() => onEditSkill(skill, courseId)}
                                                className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface border border-transparent hover:border-border rounded-full transition-colors"
                                                title="Éditer la compétence"
                                                type="button"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => onDeleteSkill(skill, courseId)}
                                                className="p-1.5 text-danger-text hover:bg-danger-bg border border-transparent hover:border-danger-border rounded-full transition-colors"
                                                title="Supprimer la compétence"
                                                type="button"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurriculumStepSection;

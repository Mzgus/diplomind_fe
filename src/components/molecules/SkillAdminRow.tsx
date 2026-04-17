import React from "react";
import type { SkillWithSteps } from "../../types";

interface SkillAdminRowProps {
    skill: SkillWithSteps;
    courseId: number;
    stepId?: number;
    onLinkStep: (skill: SkillWithSteps) => void;
    onEdit: (skill: SkillWithSteps, courseId: number) => void;
    onDelete: (skill: SkillWithSteps, courseId: number) => void;
    onUnlinkStep?: (stepId: number, skillId: number, courseId: number) => void;
}

const SkillAdminRow: React.FC<SkillAdminRowProps> = ({
    skill, courseId, stepId, onLinkStep, onEdit, onDelete, onUnlinkStep,
}) => {
    return (
        <div className="flex items-center justify-between gap-4 py-2.5 px-2 rounded-lg hover:bg-background transition-colors group">
            {/* Nom + description */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-main text-sm">{skill.name}</span>
                    {stepId && onUnlinkStep && (
                        <button
                            onClick={() => onUnlinkStep(stepId, skill.id, courseId)}
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

            {/* Boutons d'action — toujours visibles */}
            <div className="flex gap-1 flex-shrink-0">
                {/* "Réassigner" uniquement si déjà dans une étape, sinon "Lier une étape" */}
                {!stepId && (
                    <button
                        onClick={() => onLinkStep(skill)}
                        className="px-2 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-full text-xs font-medium transition-colors flex items-center gap-1 border border-primary/30"
                        title="Lier à une étape"
                        type="button"
                    >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Étape
                    </button>
                )}
                <button
                    onClick={() => onEdit(skill, courseId)}
                    className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface border border-transparent hover:border-border rounded-full transition-colors"
                    title="Éditer"
                    type="button"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button
                    onClick={() => onDelete(skill, courseId)}
                    className="p-1.5 text-danger-text hover:bg-danger-bg border border-transparent hover:border-danger-border rounded-full transition-colors"
                    title="Supprimer"
                    type="button"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default SkillAdminRow;

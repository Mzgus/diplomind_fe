import React from "react";
import type { CurriculumStep, SkillWithSteps, Skill } from "../../types";

interface CurriculumStepSectionProps {
    step: CurriculumStep;
    courseId: number;
    canEdit: boolean;
    validations?: Record<number, { status: string; comment?: string; validated_at?: string }>;
    onEditSkill: (skill: SkillWithSteps, courseId: number) => void;
    onDeleteSkill: (skill: Skill, courseId: number) => void;
    onUnlinkSkillFromStep: (stepId: number, skillId: number, courseId: number) => void;
    onValidateSkill?: (skill: SkillWithSteps, stepId: number) => void;
}

const STATUS_LABEL: Record<string, string> = {
    validated: "Validé",
    rejected: "Non validé",
    pending: "Non évalué",
};

const STATUS_COLORS: Record<string, { badge: string; dot: string }> = {
    validated:           { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" },
    rejected:            { badge: "bg-red-500/15 text-red-400 border-red-500/30",             dot: "bg-red-400" },
    partially_validated: { badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",       dot: "bg-amber-400" },
    pending:             { badge: "bg-slate-500/15 text-slate-400 border-slate-500/30",        dot: "bg-slate-500" },
};

const CurriculumStepSection: React.FC<CurriculumStepSectionProps> = ({
    step,
    courseId,
    canEdit,
    validations,
    onEditSkill,
    onDeleteSkill,
    onUnlinkSkillFromStep,
    onValidateSkill,
}) => {
    return (
        <div className="flex flex-col">
            {/* Description de l'étape */}
            {step.description && (
                <p className="px-1 pb-2 text-xs text-text-muted italic">{step.description}</p>
            )}

            {/* Liste des compétences */}
            {step.skills.length === 0 ? (
                <p className="text-xs text-text-muted italic py-3 text-center">
                    {canEdit ? "Aucune compétence — utilisez « + Compétence »" : "Aucune compétence associée"}
                </p>
            ) : (
                <div className="divide-y divide-border/50">
                    {step.skills.map((skill) => {
                        const val = validations ? validations[skill.id] : null;
                        const status = val?.status || "pending";
                        const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
                        const label = STATUS_LABEL[status] || status;

                        return (
                            <div key={skill.id} className="flex flex-col py-3 group">
                                <div className="flex items-center justify-between gap-4">
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

                                    <div className="flex gap-2 flex-shrink-0 items-center">
                                        {/* Status Badge */}
                                        {validations && (
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${colors.badge}`}>
                                                <span className={`w-1 h-1 rounded-full ${colors.dot}`} />
                                                {label}
                                            </span>
                                        )}

                                        {/* Valider — visible uniquement pour admin/teacher */}
                                        {canEdit && onValidateSkill && (
                                            <button
                                                onClick={() => onValidateSkill(skill, step.id)}
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

                                {/* Teacher Comment */}
                                {val?.comment && (
                                    <div className="mt-2 text-xs text-text-muted bg-surface/40 border-l-2 border-primary/40 pl-3 py-2 rounded-r italic">
                                        <span className="font-semibold text-text-main not-italic">Commentaire du professeur :</span> "{val.comment}"
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CurriculumStepSection;

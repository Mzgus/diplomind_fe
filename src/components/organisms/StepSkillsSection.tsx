import React from "react";
import SkillAdminRow from "../molecules/SkillAdminRow";
import type { SkillWithSteps, StepWithProject } from "../../types";

interface StepSkillsSectionProps {
    step: StepWithProject;
    skills: SkillWithSteps[];
    courseId: number;
    onLinkStep: (skill: SkillWithSteps) => void;
    onEdit: (skill: SkillWithSteps, courseId: number) => void;
    onDelete: (skill: SkillWithSteps, courseId: number) => void;
    onUnlinkStep: (stepId: number, skillId: number, courseId: number) => void;
    onAddSkillToStep: (step: StepWithProject, courseId: number) => void;
}

const StepSkillsSection: React.FC<StepSkillsSectionProps> = ({
    step, skills, courseId, onLinkStep, onEdit, onDelete, onUnlinkStep, onAddSkillToStep,
}) => {
    return (
        <div className="rounded-lg border border-border bg-background overflow-hidden">
            {/* Step header */}
            <div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-border">
                <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm font-bold text-text-main">{step.name}</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20">
                        {skills.length} compétence{skills.length !== 1 ? "s" : ""}
                    </span>
                </div>
                {/* Bouton Ajouter une compétence à cette étape */}
                <button
                    onClick={() => onAddSkillToStep(step, courseId)}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-white border border-primary/30 rounded-full transition-colors"
                    title="Ajouter une compétence à cette étape"
                    type="button"
                >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter
                </button>
            </div>

            {/* Skills list */}
            <div className="px-3 py-1">
                {skills.length === 0 ? (
                    <p className="text-xs text-text-muted italic py-2 text-center">
                        Aucune compétence — cliquez sur "Ajouter"
                    </p>
                ) : (
                    <div className="divide-y divide-border/50">
                        {skills.map((skill) => (
                            <SkillAdminRow
                                key={skill.id}
                                skill={skill}
                                courseId={courseId}
                                stepId={step.id}
                                onLinkStep={onLinkStep}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onUnlinkStep={onUnlinkStep}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StepSkillsSection;

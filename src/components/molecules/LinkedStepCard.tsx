import React from "react";
import type { Step } from "../../types";
import Icon from "../atoms/Icon";

interface LinkedStepCardProps {
    step: Step;
    canEdit: boolean;
    onDelete: (step: Step) => void;
    onEdit: (step: Step) => void;
}

const LinkedStepCard: React.FC<LinkedStepCardProps> = ({
    step,
    canEdit,
    onDelete,
    onEdit,
}) => {
    return (
        <div className="inline-flex items-start gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-sm mr-2 mb-2 group max-w-md">
            <Icon name="flag" size="md" className="text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <div
                    className={`text-text-main font-medium ${canEdit ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
                    onClick={canEdit ? () => onEdit(step) : undefined}
                    title={canEdit ? "Cliquer pour éditer" : undefined}
                >
                    {step.name}
                </div>
                {step.description && (
                    <div className="text-text-muted text-xs">{step.description}</div>
                )}
                <div className="text-text-muted text-xs mt-0.5">
                    Ordre : {step.step_order}
                </div>
            </div>
            {canEdit && (
                <button
                    onClick={() => onDelete(step)}
                    className="ml-1 p-0.5 text-text-muted hover:text-danger-text transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Supprimer l'étape"
                    type="button"
                >
                    <Icon name="trash" size="sm" />
                </button>
            )}
        </div>
    );
};

export default LinkedStepCard;

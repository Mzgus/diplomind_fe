import React from "react";
import LinkedStepCard from "../molecules/LinkedStepCard";
import ProjectActionButtons from "../molecules/ProjectActionButtons";
import Icon from "../atoms/Icon";
import type { Project, Step } from "../../types";

interface ProjectWithDetails extends Project {
    linkedSteps: Step[];
    courseName?: string;
}

interface ProjectAccordionItemProps {
    project: ProjectWithDetails;
    isExpanded: boolean;
    canEdit: boolean;
    onToggle: () => void;
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
    onAddStep: (project: ProjectWithDetails) => void;
    onEditStep: (step: Step) => void;
    onDeleteStep: (step: Step) => void;
}

const ProjectAccordionItem: React.FC<ProjectAccordionItemProps> = ({
    project,
    isExpanded,
    canEdit,
    onToggle,
    onEdit,
    onDelete,
    onAddStep,
    onEditStep,
    onDeleteStep,
}) => {
    return (
        <div className="border border-border rounded-lg overflow-hidden bg-surface">
            {/* Header cliquable */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors"
                type="button"
            >
                <div className="flex items-center gap-3">
                    <Icon
                        name="chevron-right"
                        size="lg"
                        className={`text-text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                    <h2 className="text-xl font-semibold text-text-main">{project.name}</h2>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {project.linkedSteps.length}{" "}
                        {project.linkedSteps.length === 1 ? "étape" : "étapes"}
                    </span>
                    {project.courseName && (
                        <span className="px-2 py-0.5 bg-surface border border-border text-text-muted rounded-full text-xs">
                            Associé au cours : <b>{project.courseName}</b>
                        </span>
                    )}
                </div>
            </button>

            {/* Contenu dépliable */}
            {isExpanded && (
                <div className="border-t border-border p-4 space-y-4">

                    {/* Ligne 1 : description + boutons d'action côte à côte */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            {project.description ? (
                                <p className="text-sm text-text-muted">
                                    {project.description}
                                </p>
                            ) : (
                                <p className="text-sm text-text-muted italic">Aucune description</p>
                            )}
                        </div>

                        {canEdit && (
                            <ProjectActionButtons
                                onAddStep={() => onAddStep(project)}
                                onEdit={() => onEdit(project)}
                                onDelete={() => onDelete(project)}
                            />
                        )}
                    </div>

                    {/* Ligne 2 : étapes sur toute la largeur */}
                    <div>
                        <h3 className="text-sm font-semibold text-text-main mb-2">
                            Étapes associées :
                        </h3>
                        {project.linkedSteps.length > 0 ? (
                            <div className="flex flex-wrap w-full">
                                {project.linkedSteps
                                    .slice()
                                    .sort((a, b) => a.step_order - b.step_order)
                                    .map((step) => (
                                        <LinkedStepCard
                                            key={step.id}
                                            step={step}
                                            canEdit={canEdit}
                                            onDelete={onDeleteStep}
                                            onEdit={onEditStep}
                                        />
                                    ))}
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted italic">Aucune étape liée</p>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};

export default ProjectAccordionItem;

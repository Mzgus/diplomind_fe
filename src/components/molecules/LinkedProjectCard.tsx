import React from "react";
import type { Project } from "../../types";

interface LinkedProjectCardProps {
    project: Project;
    isAdmin: boolean;
    onDelete: (project: Project) => void;
}

const LinkedProjectCard: React.FC<LinkedProjectCardProps> = ({ project, isAdmin, onDelete }) => {
    return (
        <div className="inline-flex items-start gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-sm mr-2 mb-2 group max-w-md">
            <svg className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <div className="flex-1 min-w-0">
                <div className="text-text-main font-medium">{project.name}</div>
                <div className="text-text-muted text-xs">{project.description}</div>
            </div>
            {isAdmin && (
                <button
                    onClick={() => onDelete(project)}
                    className="ml-1 p-0.5 text-text-muted hover:cursor-pointer hover:text-danger-text transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Supprimer le projet"
                    type="button"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default LinkedProjectCard;

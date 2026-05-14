import React from "react";
import type { Project } from "../../types";

interface LinkedProjectCardProps {
    project: Project;
    isAdmin: boolean;
    onUnlink: (project: Project) => void;
}

const LinkedProjectCard: React.FC<LinkedProjectCardProps> = ({ project, isAdmin, onUnlink }) => {
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
                    onClick={() => onUnlink(project)}
                    className="ml-1 p-0.5 text-text-muted hover:cursor-pointer hover:text-danger-text transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Dissocier le projet"
                    type="button"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244M3 3l18 18" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default LinkedProjectCard;

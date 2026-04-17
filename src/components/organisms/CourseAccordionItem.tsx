import React from "react";
import LinkedProjectCard from "../molecules/LinkedProjectCard";
import CourseActionButtons from "../molecules/CourseActionButtons";
import type { Course, Project } from "../../types";

interface CourseWithProjects extends Course {
    linkedProjects: Project[];
}

interface CourseAccordionItemProps {
    course: CourseWithProjects;
    isExpanded: boolean;
    isAdmin: boolean;
    onToggle: () => void;
    onEdit: (course: Course) => void;
    onDelete: (course: Course) => void;
    onLinkProject: (course: CourseWithProjects) => void;
    onDeleteProject: (project: Project) => void;
}

const CourseAccordionItem: React.FC<CourseAccordionItemProps> = ({
    course,
    isExpanded,
    isAdmin,
    onToggle,
    onEdit,
    onDelete,
    onLinkProject,
    onDeleteProject,
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
                    <svg
                        className={`h-5 w-5 text-text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <h2 className="text-xl font-semibold text-text-main">{course.name}</h2>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {course.linkedProjects.length}{" "}
                        {course.linkedProjects.length === 1 ? "projet" : "projets"}
                    </span>
                </div>
            </button>

            {/* Contenu dépliable */}
            {isExpanded && (
                <div className="border-t border-border p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-sm text-text-muted mb-4">{course.description}</p>

                            {/* Projets liés */}
                            {course.linkedProjects.length > 0 ? (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-text-main mb-2">
                                        Projets associés :
                                    </h3>
                                    {course.linkedProjects.map((project) => (
                                        <LinkedProjectCard
                                            key={project.id}
                                            project={project}
                                            isAdmin={isAdmin}
                                            onDelete={onDeleteProject}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-text-muted italic">Aucun projet lié</p>
                            )}
                        </div>

                        {/* Boutons admin */}
                        {isAdmin && (
                            <CourseActionButtons
                                onLinkProject={() => onLinkProject(course)}
                                onEdit={() => onEdit(course)}
                                onDelete={() => onDelete(course)}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseAccordionItem;

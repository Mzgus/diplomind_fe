import React from "react";
import SearchBar from "../molecules/SearchBar";
import Button from "../atoms/Buttons/Button";
import type { CurriculumCourse, CurriculumProject } from "../../types";

interface CurriculumNavTreeProps {
    courses: CurriculumCourse[];
    selectedCourseId: number | null;
    selectedProjectId: number | null;
    expandedCourseIds: Set<number>;
    canEdit: boolean;
    isAdmin: boolean;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    onSelectCourse: (courseId: number) => void;
    onSelectProject: (courseId: number, projectId: number) => void;
    onToggleCourse: (courseId: number) => void;
    onAddCourse: () => void;
    onEditCourse: (course: CurriculumCourse) => void;
    onDeleteCourse: (course: CurriculumCourse) => void;
    onAddProject: (course: CurriculumCourse) => void;
    onEditProject: (project: CurriculumProject) => void;
    onDeleteProject: (project: CurriculumProject) => void;
}

const CurriculumNavTree: React.FC<CurriculumNavTreeProps> = ({
    courses,
    selectedCourseId,
    selectedProjectId,
    expandedCourseIds,
    canEdit,
    isAdmin,
    searchQuery,
    onSearchChange,
    onSelectCourse,
    onSelectProject,
    onToggleCourse,
    onAddCourse,
    onEditCourse,
    onDeleteCourse,
    onAddProject,
    onEditProject,
    onDeleteProject,
}) => {
    // Filter courses by search query
    const filtered = courses.filter((course) => {
        const q = searchQuery.toLowerCase();
        if (!q) return true;
        if (course.name.toLowerCase().includes(q)) return true;
        if (course.description?.toLowerCase().includes(q)) return true;
        return course.linkedProjects.some((p) => p.name.toLowerCase().includes(q));
    });

    return (
        <aside className="flex flex-col w-full h-full border-r border-border bg-surface overflow-hidden">
            {/* Search + Add */}
            <div className="p-3 space-y-2 border-b border-border flex-shrink-0">
                <SearchBar
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Rechercher..."
                />
                {isAdmin && (
                    <Button className="w-full text-sm" onClick={onAddCourse}>
                        + Ajouter un cours
                    </Button>
                )}
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto py-2">
                {filtered.length === 0 && (
                    <p className="px-4 py-6 text-sm text-text-muted text-center">
                        Aucun cours trouvé
                    </p>
                )}

                {filtered.map((course) => {
                    const isExpanded = expandedCourseIds.has(course.id);
                    const isCourseSelected = selectedCourseId === course.id;

                    return (
                        <div key={course.id}>
                            {/* Course row */}
                            <div
                                className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                                    isCourseSelected && !selectedProjectId
                                        ? "bg-primary/10 text-primary"
                                        : "hover:bg-background"
                                }`}
                                onClick={() => {
                                    onSelectCourse(course.id);
                                    if (!isExpanded) onToggleCourse(course.id);
                                }}
                            >
                                {/* Chevron */}
                                <button
                                    type="button"
                                    className="flex-shrink-0 p-0.5 rounded text-text-muted hover:text-text-main transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleCourse(course.id);
                                    }}
                                    title={isExpanded ? "Réduire" : "Développer"}
                                >
                                    <svg
                                        className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                {/* Folder icon */}
                                <svg className="h-4 w-4 flex-shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>

                                {/* Name + count */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-text-main truncate">{course.name}</p>
                                    <p className="text-xs text-text-muted">
                                        {course.linkedProjects.length} projet{course.linkedProjects.length !== 1 ? "s" : ""}
                                    </p>
                                </div>

                                {/* Action buttons — visible on hover if canEdit */}
                                {canEdit && (
                                    <div
                                        className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => onAddProject(course)}
                                            className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
                                            title="Ajouter un projet"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onEditCourse(course)}
                                            className="p-1 rounded text-text-muted hover:text-text-main hover:bg-background transition-colors"
                                            title="Modifier le cours"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        {isAdmin && (
                                            <button
                                                type="button"
                                                onClick={() => onDeleteCourse(course)}
                                                className="p-1 rounded text-danger-text hover:bg-danger-bg transition-colors"
                                                title="Supprimer le cours"
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Projects — shown when course expanded */}
                            {isExpanded && course.linkedProjects.map((project) => {
                                const isProjectSelected = selectedProjectId === project.id;
                                return (
                                    <div
                                        key={project.id}
                                        className={`group flex items-center gap-2 pl-10 pr-3 py-1.5 cursor-pointer transition-colors ${
                                            isProjectSelected
                                                ? "bg-primary/10 border-l-4 border-primary text-primary font-semibold"
                                                : "bg-background/80 hover:bg-background border-l-4 border-transparent"
                                        }`}
                                        onClick={() => onSelectProject(course.id, project.id)}
                                    >
                                        {/* Cube icon */}
                                        <svg
                                            className={`h-4 w-4 flex-shrink-0 ${isProjectSelected ? "text-primary" : "text-text-muted"}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>

                                        {/* Name + count */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm truncate ${isProjectSelected ? "text-primary" : "text-text-main/80"}`}>
                                                {project.name}
                                            </p>
                                            <p className="text-[10px] text-text-muted/70 uppercase tracking-wider font-semibold">
                                                {project.linkedSteps.length} étape{project.linkedSteps.length !== 1 ? "s" : ""}
                                            </p>
                                        </div>

                                        {/* Action buttons — hover */}
                                        {canEdit && (
                                            <div
                                                className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => onEditProject(project)}
                                                    className="p-1 rounded text-text-muted hover:text-text-main hover:bg-surface transition-colors"
                                                    title="Modifier le projet"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDeleteProject(project)}
                                                    className="p-1 rounded text-danger-text hover:bg-danger-bg transition-colors"
                                                    title="Supprimer le projet"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default CurriculumNavTree;

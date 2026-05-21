import React from "react";
import SearchBar from "./SearchBar";

interface ClassItem {
    id: number;
    name: string;
}

interface CourseItem {
    id: number;
    name: string;
}

interface ProjectItem {
    id: number;
    name: string;
}

interface ValidationFiltersProps {
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedClassId: string;
    onClassChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    classes: ClassItem[];
    selectedCourseId: string;
    onCourseChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    courses: CourseItem[];
    selectedProjectId: string;
    onProjectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    projects: ProjectItem[];
}

const ValidationFilters: React.FC<ValidationFiltersProps> = ({
    searchQuery,
    onSearchChange,
    selectedClassId,
    onClassChange,
    classes,
    selectedCourseId,
    onCourseChange,
    courses,
    selectedProjectId,
    onProjectChange,
    projects,
}) => {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Recherche étudiant */}
            <div className="w-64">
                <SearchBar
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Rechercher un étudiant..."
                />
            </div>

            {/* Select Cours */}
            <select
                value={selectedCourseId}
                onChange={onCourseChange}
                className="px-4 py-2 bg-surface border border-border rounded-lg shadow-sm text-sm font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer hover:bg-background transition-colors"
            >
                {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                        Cours : {course.name}
                    </option>
                ))}
            </select>

            {/* Select Classe */}
            <select
                value={selectedClassId}
                onChange={onClassChange}
                className="px-4 py-2 bg-surface border border-border rounded-lg shadow-sm text-sm font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer hover:bg-background transition-colors"
            >
                {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                        Classe : {cls.name}
                    </option>
                ))}
            </select>

            {/* Select Projet */}
            <select
                value={selectedProjectId}
                onChange={onProjectChange}
                className="px-4 py-2 bg-surface border border-border rounded-lg shadow-sm text-sm font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer hover:bg-background transition-colors"
            >
                {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                        Projet : {project.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ValidationFilters;

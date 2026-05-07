import React from "react";
import StepSkillsSection from "./StepSkillsSection";
import SkillAdminRow from "../molecules/SkillAdminRow";
import type { Project, CourseWithSkills, SkillWithSteps, StepWithProject } from "../../types";

export interface AdminStepView {
    step: StepWithProject;
    skills: SkillWithSteps[];
}

export interface AdminProjectView {
    project: Project;
    steps: AdminStepView[];
}

interface AdminSkillsCourseAccordionProps {
    course: CourseWithSkills;
    projects: AdminProjectView[];
    unassignedSkills: SkillWithSteps[];
    isExpanded: boolean;
    expandedProjectIds: Set<number>;
    onToggleCourse: () => void;
    onToggleProject: (projectId: number) => void;
    onLinkStep: (skill: SkillWithSteps) => void;
    onEdit: (skill: SkillWithSteps, courseId: number) => void;
    onDelete: (skill: SkillWithSteps, courseId: number) => void;
    onUnlinkStep: (stepId: number, skillId: number, courseId: number) => void;
    onAddSkillToStep: (step: StepWithProject, courseId: number) => void;
}

const AdminSkillsCourseAccordion: React.FC<AdminSkillsCourseAccordionProps> = ({
    course, projects, unassignedSkills,
    isExpanded, expandedProjectIds,
    onToggleCourse, onToggleProject,
    onLinkStep, onEdit, onDelete, onUnlinkStep, onAddSkillToStep,
}) => {
    // Badge cours = nombre de projets
    const projectCount = projects.length;

    return (
        <div className="border border-border rounded-lg overflow-hidden bg-surface">
            {/* Course header */}
            <button
                onClick={onToggleCourse}
                className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors"
                type="button"
            >
                <div className="flex items-center gap-3">
                    <svg
                        className={`h-5 w-5 text-text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <h2 className="text-xl font-semibold text-text-main">{course.name}</h2>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                        {course.skillsLoaded ? projectCount : "..."} projet{projectCount !== 1 ? "s" : ""}
                    </span>
                </div>
            </button>

            {/* Expanded body */}
            {isExpanded && (
                <div className="border-t border-border divide-y divide-border">
                    {!course.skillsLoaded ? (
                        <div className="p-4 text-center text-text-muted">Chargement...</div>
                    ) : projects.length === 0 && unassignedSkills.length === 0 ? (
                        <div className="p-4 text-center text-text-muted">Aucune compétence associée à ce cours.</div>
                    ) : (
                        <>
                            {/* Projects > Steps > Skills */}
                            {projects.map(({ project, steps }) => {
                                const isProjExpanded = expandedProjectIds.has(project.id);
                                // Dédupliquer les compétences par ID pour éviter le double-comptage
                                const uniqueSkillIds = new Set(steps.flatMap((s) => s.skills.map((sk) => sk.id)));
                                const skillCount = uniqueSkillIds.size;

                                return (
                                    <div key={project.id} className="bg-background/40">
                                        {/* Project header */}
                                        <button
                                            onClick={() => onToggleProject(project.id)}
                                            className="w-full flex items-center justify-between px-6 py-3 text-left hover:bg-background transition-colors"
                                            type="button"
                                        >
                                            <div className="flex items-center gap-3">
                                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                </svg>
                                                <span className="font-semibold text-text-main">{project.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Badge = nombre d'étapes */}
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                                                    {steps.length} étape{steps.length !== 1 ? "s" : ""}
                                                </span>
                                                <svg
                                                    className={`w-4 h-4 text-text-muted transition-transform ${isProjExpanded ? "rotate-90" : ""}`}
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>

                                        {/* Steps + skills */}
                                        {isProjExpanded && (
                                            <div className="px-6 pb-4 pt-2 space-y-3">
                                                {steps.length === 0 ? (
                                                    <p className="text-text-muted text-sm italic py-2">Aucune étape pour ce projet.</p>
                                                ) : (
                                                    steps.map(({ step, skills }) => (
                                                        <StepSkillsSection
                                                            key={step.id}
                                                            step={step}
                                                            skills={skills}
                                                            courseId={course.id}
                                                            onLinkStep={onLinkStep}
                                                            onEdit={onEdit}
                                                            onDelete={onDelete}
                                                            onUnlinkStep={onUnlinkStep}
                                                            onAddSkillToStep={onAddSkillToStep}
                                                        />
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Compétences non assignées à une étape */}
                            {unassignedSkills.length > 0 && (
                                <div className="p-4 bg-background/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="h-4 w-4 text-warning-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-bold text-text-main">Non assignées à une étape</span>
                                        <span className="px-2 py-0.5 bg-warning-bg text-warning-text border border-warning-border rounded-full text-xs font-semibold">
                                            {unassignedSkills.length}
                                        </span>
                                    </div>
                                    <div className="divide-y divide-border rounded-lg border border-border bg-surface overflow-hidden px-2">
                                        {unassignedSkills.map((skill) => (
                                            <SkillAdminRow
                                                key={skill.id}
                                                skill={skill}
                                                courseId={course.id}
                                                onLinkStep={onLinkStep}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminSkillsCourseAccordion;

import React from "react";
import SkillColumnHeader from "../molecules/SkillColumnHeader";
import StudentRow from "../molecules/StudentRow";

interface Step {
    id: number;
    name: string;
}

interface Skill {
    id: number;
    name: string;
    description?: string;
}

interface SkillWithUid extends Skill {
    uid: string;
}

interface StepWithSkills extends Step {
    skills: Skill[];
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    profile_picture?: string;
}

interface ValidationMatrixProps {
    stepsWithSkills: StepWithSkills[];
    allSkills: SkillWithUid[];
    filteredStudents: Student[];
    validations: Record<string, { status: string; comment: string }>;
    loadingMatrix: boolean;
    onCellClick: (studentId: number, skillId: number) => void;
    preselectedSkillId?: number;
}

const ValidationMatrix: React.FC<ValidationMatrixProps> = ({
    stepsWithSkills,
    allSkills,
    filteredStudents,
    validations,
    loadingMatrix,
    onCellClick,
    preselectedSkillId,
}) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!preselectedSkillId || !containerRef.current) return;

        const container = containerRef.current;
        const timeoutId = setTimeout(() => {
            const highlightedHeader = container.querySelector(`th[data-skill-id="${preselectedSkillId}"]`) as HTMLElement | null;

            if (highlightedHeader) {
                const stickyTh = container.querySelector("thead th.sticky.left-0") as HTMLElement | null;
                const stickyWidth = stickyTh ? stickyTh.offsetWidth : 250;

                const containerWidth = container.clientWidth;
                const thOffsetLeft = highlightedHeader.offsetLeft;
                const thWidth = highlightedHeader.offsetWidth;

                // Center the column in the visible scrollable area (excluding the sticky column width)
                const visibleAreaCenter = stickyWidth + (containerWidth - stickyWidth) / 2;
                const targetScrollLeft = thOffsetLeft - visibleAreaCenter + (thWidth / 2);

                container.scrollTo({
                    left: Math.max(0, targetScrollLeft),
                    behavior: "smooth",
                });
            }
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [preselectedSkillId, allSkills]);

    if (loadingMatrix) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-text-muted">Chargement de la matrice...</p>
            </div>
        );
    }

    if (allSkills.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-text-muted">
                    Aucune compétence trouvée pour ce projet. Vérifiez que des étapes et compétences sont associées.
                </p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="overflow-auto flex-1 relative custom-scrollbar">
            <table className="border-separate border-spacing-0">
                <thead>
                    {/* Ligne des étapes */}
                    <tr>
                        <th className="sticky top-0 left-0 z-30 bg-surface p-4 border-b border-r border-border whitespace-nowrap h-16 min-w-[250px]">
                            <div className="flex items-center justify-end h-full text-text-muted font-bold text-sm uppercase tracking-wider">
                                Étapes &rarr;
                            </div>
                        </th>
                        {stepsWithSkills.map((step) => (
                            <th
                                key={step.id}
                                colSpan={step.skills.length || 1}
                                className="sticky top-0 z-20 bg-background p-3 border-b border-r border-border text-center text-xs font-bold text-text-muted uppercase tracking-wider"
                            >
                                {step.name}
                            </th>
                        ))}
                    </tr>

                    {/* Ligne des compétences */}
                    <tr>
                        <th className="sticky top-16 left-0 z-30 bg-surface p-4 border-b border-r border-border shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center justify-end h-full text-text-muted font-bold text-sm uppercase tracking-wider">
                                Compétences &rarr;
                            </div>
                        </th>
                        {allSkills.map((skill) => (
                            <SkillColumnHeader
                                key={skill.uid}
                                uid={skill.uid}
                                skillId={skill.id}
                                name={skill.name}
                                description={skill.description}
                                isHighlighted={preselectedSkillId === skill.id}
                            />
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {filteredStudents.length === 0 ? (
                        <tr>
                            <td colSpan={allSkills.length + 1} className="p-8 text-center text-text-muted">
                                Aucun étudiant trouvé dans cette classe.
                            </td>
                        </tr>
                    ) : (
                        filteredStudents.map((student) => (
                            <StudentRow
                                key={student.id}
                                student={student}
                                skills={allSkills}
                                validations={validations}
                                onCellClick={onCellClick}
                                preselectedSkillId={preselectedSkillId}
                            />
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ValidationMatrix;

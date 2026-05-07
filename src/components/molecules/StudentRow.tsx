import React from "react";
import ValidationCell from "./ValidationCell";

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    profile_picture?: string;
}

interface SkillWithUid {
    id: number;
    uid: string;
    name: string;
    description?: string;
}

interface StudentRowProps {
    student: Student;
    skills: SkillWithUid[];
    validations: Record<string, { status: string; comment: string }>;
    onCellClick: (studentId: number, skillId: number) => void;
}

const StudentRow: React.FC<StudentRowProps> = ({ student, skills, validations, onCellClick }) => {
    return (
        <tr className="group">
            {/* Cellule sticky gauche : avatar + nom */}
            <td className="sticky left-0 z-10 bg-surface p-4 border-b border-r border-border group-hover:bg-primary/10 transition-colors shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-background overflow-hidden border border-border">
                        {student.profile_picture ? (
                            <img
                                src={student.profile_picture}
                                alt={`${student.first_name} ${student.last_name}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                                {student.first_name?.[0]}{student.last_name?.[0]}
                            </div>
                        )}
                    </div>
                    <span className="font-medium text-text-main text-sm group-hover:text-primary-hover transition-colors">
                        {student.last_name} {student.first_name}
                    </span>
                </div>
            </td>

            {/* Cases de validation */}
            {skills.map((skill) => {
                const key = `${student.id}_${skill.id}`;
                const validation = validations[key];
                return (
                    <ValidationCell
                        key={skill.uid}
                        status={validation?.status}
                        onClick={() => onCellClick(student.id, skill.id)}
                    />
                );
            })}
        </tr>
    );
};

export default StudentRow;

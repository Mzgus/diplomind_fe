import React from "react";
import Icon from "../atoms/Icon";

interface Student {
    id: number;
    name: string;
}

interface LinkedStudentCardProps {
    student: Student;
    canEdit?: boolean;
    onDelete?: (student: Student) => void;
}

const LinkedStudentCard: React.FC<LinkedStudentCardProps> = ({ student, canEdit, onDelete }) => {
    return (
        <div className="inline-flex items-start gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-sm mr-2 mb-2 group max-w-md">
            <svg
                className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
            </svg>
            <span className="text-text-main font-medium truncate flex-1 min-w-0">{student.name}</span>
            {canEdit && onDelete && (
                <button
                    onClick={() => onDelete(student)}
                    className="ml-1 p-0.5 text-text-muted hover:text-danger-text transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Retirer l'élève de la classe"
                    type="button"
                >
                    <Icon name="trash" size="sm" />
                </button>
            )}
        </div>
    );
};

export default LinkedStudentCard;

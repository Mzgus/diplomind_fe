import React from "react";
import LinkedStudentCard from "../molecules/LinkedStudentCard";
import ClassActionButtons from "../molecules/ClassActionButtons";
import Icon from "../atoms/Icon";
import type { Class } from "../../types";

interface Student {
    id: number;
    name: string;
}

interface ClassWithDetails extends Class {
    studentCount: number | string;
    students: Student[];
}

interface ClassAccordionItemProps {
    cls: ClassWithDetails;
    isExpanded: boolean;
    canEdit: boolean;
    onToggle: () => void;
    onEdit: (cls: ClassWithDetails) => void;
    onDelete: (cls: Class) => void;
    onDeleteStudent: (student: Student, classId: number) => void;
}

const ClassAccordionItem: React.FC<ClassAccordionItemProps> = ({
    cls,
    isExpanded,
    canEdit,
    onToggle,
    onEdit,
    onDelete,
    onDeleteStudent,
}) => {
    const studentCount = cls.studentCount;
    const studentCountNum = typeof studentCount === "number" ? studentCount : 0;

    return (
        <div className="border border-border rounded-lg overflow-hidden bg-surface">
            {/* Header : toggle à gauche, boutons d'action à droite */}
            <div className="flex items-center justify-between px-4 hover:bg-background transition-colors">
                <button
                    onClick={onToggle}
                    className="flex items-center gap-3 flex-1 py-4 text-left"
                    type="button"
                >
                    <Icon
                        name="chevron-right"
                        size="lg"
                        className={`text-text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                    <h2 className="text-xl font-semibold text-text-main">{cls.name}</h2>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {studentCount}{" "}
                        {studentCountNum === 1 ? "élève" : "élèves"}
                    </span>
                </button>

                {canEdit && (
                    <ClassActionButtons
                        onEdit={() => onEdit(cls)}
                        onDelete={() => onDelete(cls)}
                    />
                )}
            </div>

            {/* Contenu dépliable */}
            {isExpanded && (
                <div className="border-t border-border p-4 space-y-4">

                    {/* Élèves sur toute la largeur */}
                    <div>
                        <h3 className="text-sm font-semibold text-text-main mb-2">
                            Élèves associés :
                        </h3>
                        {cls.students && cls.students.length > 0 ? (
                            <div className="flex flex-wrap w-full">
                                {cls.students.map((student) => (
                                    <LinkedStudentCard
                                        key={student.id}
                                        student={student}
                                        canEdit={canEdit}
                                        onDelete={(s) => onDeleteStudent(s, cls.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted italic">Aucun élève associé</p>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};

export default ClassAccordionItem;

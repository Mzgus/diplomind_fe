import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Buttons/Button";
import InputGroup from "../molecules/InputGroup";
import SelectGroup from "../molecules/SelectGroup";

interface ClassData {
    id?: number;
    name: string;
    year: number;
    students: { id: number; name: string }[];
}

interface ClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (classData: any) => void;
    existingStudents: { id: number; name: string }[];
    initialData?: ClassData | null;
}

const ClassModal: React.FC<ClassModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingStudents,
    initialData
}) => {
    const [className, setClassName] = useState("");
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [assignedStudents, setAssignedStudents] = useState<
        { id: number; name: string }[]
    >([]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setClassName(initialData.name);
                setYear((initialData.year || new Date().getFullYear()).toString());
                setAssignedStudents(initialData.students || []);
            } else {
                setClassName("");
                setYear(new Date().getFullYear().toString());
                setAssignedStudents([]);
            }
            setSelectedStudentId("");
        }
    }, [isOpen, initialData]);

    const handleAddStudent = () => {
        if (!selectedStudentId) return;
        const idNum = Number(selectedStudentId);

        const studentToAdd = existingStudents.find(
            (s) => s.id === idNum
        );
        if (studentToAdd && !assignedStudents.some((s) => s.id === studentToAdd.id)) {
            setAssignedStudents([...assignedStudents, studentToAdd]);
            setSelectedStudentId(""); // Reset selection
        }
    };

    const handleRemoveStudent = (studentId: number) => {
        setAssignedStudents(assignedStudents.filter((s) => s.id !== studentId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const classData = {
            id: initialData?.id, // Pass ID if editing
            name: className,
            year: parseInt(year) || new Date().getFullYear(),
            studentIds: assignedStudents.map((s) => s.id),
        };

        onSave(classData);
    };

    // Filtrer les étudiants déjà assignés pour ne pas les afficher dans le select
    const availableStudents = existingStudents.filter(
        (student) => !assignedStudents.some((s) => s.id === student.id)
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-5xl rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-0">
                    <h2 className="text-2xl font-bold">
                        {initialData ? "Éditer la classe" : "Créer une classe"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-main focus:outline-none"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Colonne Gauche : Info Classe */}
                        <div className="flex-1 space-y-4">
                            <InputGroup
                                id="class-name"
                                label="Nom"
                                placeholder="Nom..."
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                required
                            />
                            <InputGroup
                                id="class-year"
                                label="Année (ex: 2024)"
                                type="number"
                                placeholder="2024"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                required
                            />
                        </div>

                        {/* Colonne Droite : Associations Élèves */}
                        <div className="flex-1">
                            <div className="flex items-end gap-2 mb-4">
                                <div className="flex-grow">
                                    <SelectGroup
                                        id="add-student"
                                        label="Associer des élèves"
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                    >
                                        <option value="" disabled>
                                            Choisir élève...
                                        </option>
                                        {availableStudents.map((student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.name}
                                            </option>
                                        ))}
                                    </SelectGroup>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleAddStudent}
                                    className="bg-primary hover:bg-primary-hover mb-4 h-[46px] w-[46px] flex items-center justify-center rounded-full p-0 text-white"
                                    disabled={!selectedStudentId}
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                </Button>
                            </div>

                            {/* Liste des élèves assignés */}
                            <div className="space-y-2">
                                {assignedStudents.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex justify-between items-center bg-background text-text-main px-4 py-2 rounded-full shadow-sm border border-border"
                                    >
                                        <span>{student.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStudent(student.id)}
                                            className="text-danger-text hover:text-danger-text/80 focus:outline-none"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                {assignedStudents.length === 0 && (
                                    <p className="text-text-muted text-sm italic">
                                        Aucun élève associé pour le moment.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-border">
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-hover px-8 py-2 rounded-full text-white"
                        >
                            Confirmer
                        </Button>
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-secondary hover:bg-secondary-hover px-8 py-2 rounded-full text-white"
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ClassModal;

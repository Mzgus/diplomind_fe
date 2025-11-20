import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Button";
import InputGroup from "../molecules/InputGroup";
import SelectGroup from "../molecules/SelectGroup";

interface ClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (classData: any) => void;
    existingStudents: { id: string; name: string }[];
}

const ClassModal: React.FC<ClassModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingStudents,
}) => {
    const [className, setClassName] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [assignedStudents, setAssignedStudents] = useState<
        { id: string; name: string }[]
    >([]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setClassName("");
            setSelectedStudentId("");
            setAssignedStudents([]);
        }
    }, [isOpen]);

    const handleAddStudent = () => {
        if (!selectedStudentId) return;

        const studentToAdd = existingStudents.find(
            (s) => s.id === selectedStudentId
        );
        if (studentToAdd && !assignedStudents.some((s) => s.id === studentToAdd.id)) {
            setAssignedStudents([...assignedStudents, studentToAdd]);
            setSelectedStudentId(""); // Reset selection
        }
    };

    const handleRemoveStudent = (studentId: string) => {
        setAssignedStudents(assignedStudents.filter((s) => s.id !== studentId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const classData = {
            name: className,
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
            <div className="w-full max-w-5xl rounded-xl bg-[#2D525B] text-white shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-0">
                    <h2 className="text-2xl font-bold">
                        Formulaire de création / édition de classe
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-300 hover:text-white focus:outline-none"
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
                        <div className="flex-1">
                            <InputGroup
                                id="class-name"
                                label="Nom"
                                placeholder="Nom..."
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
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
                                    className="bg-[#4DA7C8] hover:bg-[#3b8da6] mb-4 h-[46px] w-[46px] flex items-center justify-center rounded-full p-0"
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
                                        className="flex justify-between items-center bg-white text-gray-800 px-4 py-2 rounded-full shadow-sm"
                                    >
                                        <span>{student.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStudent(student.id)}
                                            className="text-red-500 hover:text-red-700 focus:outline-none"
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
                                    <p className="text-gray-400 text-sm italic">
                                        Aucun élève associé pour le moment.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-white/10">
                        <Button
                            type="submit"
                            className="bg-[#4DA7C8] hover:bg-[#3b8da6] px-8 py-2 rounded-full"
                        >
                            Confirmer
                        </Button>
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-[#4DA7C8] hover:bg-[#3b8da6] px-8 py-2 rounded-full"
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

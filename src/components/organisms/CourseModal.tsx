import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Buttons/Button";
import InputGroup from "../molecules/InputGroup";
import TextAreaGroup from "../molecules/TextAreaGroup";

interface CourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (courseData: any) => void;
    courseToEdit?: { id: number; name: string; description: string } | null;
}

const CourseModal: React.FC<CourseModalProps> = ({
    isOpen,
    onClose,
    onSave,
    courseToEdit,
}) => {
    // State pour le cours
    const [courseName, setCourseName] = useState("");
    const [courseDescription, setCourseDescription] = useState("");

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            if (courseToEdit) {
                // Edit mode: pre-fill with existing data
                setCourseName(courseToEdit.name);
                setCourseDescription(courseToEdit.description);
            } else {
                // Create mode: reset to empty
                setCourseName("");
                setCourseDescription("");
            }
        }
    }, [isOpen, courseToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const courseData = {
            id: courseToEdit?.id,
            name: courseName,
            description: courseDescription,
        };

        onSave(courseData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-3xl rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-0">
                    <h2 className="text-2xl font-bold">
                        {courseToEdit ? "Modifier le cours" : "Créer un nouveau cours"}
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
                    <InputGroup
                        id="course-name"
                        label="Nom du cours"
                        placeholder="Nom du cours..."
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        required
                    />
                    <TextAreaGroup
                        id="course-description"
                        label="Description du cours"
                        placeholder="Description du cours..."
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                        required
                    />

                    {/* Footer */}
                    <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-border">
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-hover px-8 py-2 rounded-full text-white"
                        >
                            {courseToEdit ? "Sauvegarder" : "Créer"}
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

export default CourseModal;

import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Buttons/Button";
import InputGroup from "../molecules/InputGroup";
import TextAreaGroup from "../molecules/TextAreaGroup";

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (projectData: { id?: number; name: string; description: string; courseId?: number }) => void;
    initialData?: { id?: number; name?: string; description?: string; course_id?: number } | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
}) => {
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setProjectName(initialData.name ?? "");
                setProjectDescription(initialData.description ?? "");
            } else {
                setProjectName("");
                setProjectDescription("");
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: initialData?.id,
            name: projectName,
            description: projectDescription,
            courseId: initialData?.course_id,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-lg rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-0">
                    <h2 className="text-2xl font-bold">
                        {initialData?.id ? "Éditer le projet" : "Créer un nouveau projet"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-main focus:outline-none"
                        type="button"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    <InputGroup
                        id="project-name"
                        label="Nom du projet"
                        placeholder="Ex : Faire la maquette de son projet final"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                    />
                    <TextAreaGroup
                        id="project-description"
                        label="Description"
                        placeholder="Description du projet..."
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-secondary hover:bg-secondary-hover px-6 py-2 rounded-full text-white"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-hover px-6 py-2 rounded-full text-white"
                        >
                            {initialData?.id ? "Mettre à jour" : "Créer"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ProjectModal;

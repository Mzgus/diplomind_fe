import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Button";
import InputGroup from "../molecules/InputGroup";
import TextAreaGroup from "../molecules/TextAreaGroup";
import SelectGroup from "../molecules/SelectGroup";

interface CourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (courseData: any, projectData: any | null) => void;
    existingProjects: { id: string; name: string }[];
}

const CourseModal: React.FC<CourseModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingProjects,
}) => {
    // State pour le cours
    const [courseName, setCourseName] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");

    // State pour le nouveau projet
    const [showNewProjectForm, setShowNewProjectForm] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [isProjectConfirmed, setIsProjectConfirmed] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setCourseName("");
            setCourseDescription("");
            setSelectedProjectId("");
            setShowNewProjectForm(false);
            setProjectName("");
            setProjectDescription("");
            setIsProjectConfirmed(false);
        }
    }, [isOpen]);

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedProjectId(value);
        if (value === "create_new") {
            setShowNewProjectForm(true);
            setIsProjectConfirmed(false);
        } else {
            setShowNewProjectForm(false);
            setIsProjectConfirmed(true);
        }
    };

    const handleConfirmProject = () => {
        if (projectName.trim() && projectDescription.trim()) {
            setIsProjectConfirmed(true);
        } else {
            alert("Veuillez remplir tous les champs du projet.");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (showNewProjectForm && !isProjectConfirmed) {
            alert("Veuillez confirmer la création du projet avant de continuer.");
            return;
        }

        const courseData = {
            name: courseName,
            description: courseDescription,
        };
        const projectData = showNewProjectForm
            ? { name: projectName, description: projectDescription }
            : selectedProjectId
                ? { id: selectedProjectId }
                : null;

        onSave(courseData, projectData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-5xl rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-0">
                    <h2 className="text-2xl font-bold">
                        Formulaire de création / édition de cours
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
                        {/* Colonne Gauche : Info Cours */}
                        <div className="flex-1">
                            <InputGroup
                                id="course-name"
                                label="Nom cours"
                                placeholder="Nom cours..."
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                required
                            />
                            <TextAreaGroup
                                id="course-description"
                                label="Description cours"
                                placeholder="Description cours..."
                                value={courseDescription}
                                onChange={(e) => setCourseDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* Colonne Droite : Associations + Sous-formulaire Projet */}
                        <div className="flex-1">
                            <SelectGroup
                                id="associate-project"
                                label="Associer des projets au cours"
                                value={selectedProjectId}
                                onChange={handleProjectChange}
                            >
                                <option value="" disabled>
                                    Sélectionner...
                                </option>
                                {existingProjects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                                <option value="create_new">+ Nouveau projet</option>
                            </SelectGroup>

                            {/* Panneau Nouveau Projet */}
                            {showNewProjectForm && (
                                <div
                                    className={`mt-6 bg-background rounded-xl p-6 shadow-inner animate-fade-in transition-all duration-300 ${isProjectConfirmed
                                        ? "opacity-75 border-2 border-success-border"
                                        : ""
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-text-main">
                                            Création d'un projet
                                        </h3>
                                        {isProjectConfirmed && (
                                            <span className="text-success-text font-bold text-sm flex items-center">
                                                <svg
                                                    className="w-5 h-5 mr-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                Confirmé
                                            </span>
                                        )}
                                    </div>

                                    <InputGroup
                                        id="project-name"
                                        label="Nom projet"
                                        placeholder="Nom projet..."
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        required
                                        disabled={isProjectConfirmed}
                                    />
                                    <TextAreaGroup
                                        id="project-description"
                                        label="Description projet"
                                        placeholder="Description projet..."
                                        value={projectDescription}
                                        onChange={(e) => setProjectDescription(e.target.value)}
                                        required
                                        disabled={isProjectConfirmed}
                                    />

                                    <div className="flex justify-center gap-4 mt-4">
                                        {!isProjectConfirmed ? (
                                            <>
                                                <Button
                                                    type="button"
                                                    onClick={handleConfirmProject}
                                                    className="bg-primary hover:bg-primary-hover px-8 text-white"
                                                >
                                                    Confirmer
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowNewProjectForm(false);
                                                        setSelectedProjectId("");
                                                        setIsProjectConfirmed(false);
                                                    }}
                                                    className="bg-secondary hover:bg-secondary-hover px-8 text-white"
                                                >
                                                    Annuler
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={() => setIsProjectConfirmed(false)}
                                                className="bg-background/20 hover:bg-background/30 px-8 text-sm text-text-main"
                                            >
                                                Modifier
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-border">
                        <Button
                            type="submit"
                            className={`bg-primary hover:bg-primary-hover px-8 py-2 rounded-full text-white ${showNewProjectForm && !isProjectConfirmed
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                                }`}
                            disabled={showNewProjectForm && !isProjectConfirmed}
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

export default CourseModal;

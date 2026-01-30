import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Button";
import InputGroup from "../molecules/InputGroup";
import TextAreaGroup from "../molecules/TextAreaGroup";
import SelectGroup from "../molecules/SelectGroup";

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (projectData: any, stepData: any | null) => void;
    existingCourses: { id: string; name: string }[];
    existingSteps: { id: string; name: string }[];
    initialData?: any;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingCourses,
    existingSteps,
    initialData
}) => {
    // State pour le projet
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedStepId, setSelectedStepId] = useState("");

    // State pour la nouvelle étape
    const [showNewStepForm, setShowNewStepForm] = useState(false);
    const [stepName, setStepName] = useState("");
    const [stepDescription, setStepDescription] = useState("");
    const [isStepConfirmed, setIsStepConfirmed] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setProjectName(initialData.name);
                setProjectDescription(initialData.description || "");
                setSelectedCourseId(initialData.course_id ? initialData.course_id.toString() : "");
                // No easy way to prefill "Step" logic for edit, as Project has many steps.
                // Reset step form
                setSelectedStepId("");
                setShowNewStepForm(false);
            } else {
                setProjectName("");
                setProjectDescription("");
                setSelectedCourseId("");
                setSelectedStepId("");
                setShowNewStepForm(false);
            }
            setStepName("");
            setStepDescription("");
            setIsStepConfirmed(false);
        }
    }, [isOpen, initialData]);

    const handleStepChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedStepId(value);
        if (value === "create_new") {
            setShowNewStepForm(true);
            setIsStepConfirmed(false);
        } else {
            setShowNewStepForm(false);
            setIsStepConfirmed(true);
        }
    };

    const handleConfirmStep = () => {
        if (stepName.trim() && stepDescription.trim()) {
            setIsStepConfirmed(true);
        } else {
            alert("Veuillez remplir tous les champs de l'étape.");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (showNewStepForm && !isStepConfirmed) {
            alert("Veuillez confirmer la création de l'étape avant de continuer.");
            return;
        }

        const projectData = {
            id: initialData?.id,
            name: projectName,
            description: projectDescription,
            courseId: selectedCourseId,
        };
        const stepData = showNewStepForm
            ? { name: stepName, description: stepDescription }
            : selectedStepId
                ? { id: selectedStepId }
                : null;

        onSave(projectData, stepData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-5xl rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-0">
                    <h2 className="text-2xl font-bold">
                        {initialData ? "Éditer le projet" : "Créer un nouveau projet"}
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
                        {/* Colonne Gauche : Info Projet + Sous-formulaire Étape */}
                        <div className="flex-1">
                            <InputGroup
                                id="project-name"
                                label="Nom du projet"
                                placeholder="Faire la maquette de son projet final"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                required
                            />
                            <TextAreaGroup
                                id="project-description"
                                label="Description projet"
                                placeholder="Description projet..."
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                required
                            />

                            {/* Panneau Nouvelle Étape */}
                            {showNewStepForm && (
                                <div
                                    className={`mt-6 bg-background rounded-xl p-6 shadow-inner animate-fade-in transition-all duration-300 ${isStepConfirmed
                                        ? "opacity-75 border-2 border-success-border"
                                        : ""
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-text-main">
                                            Création de étape
                                        </h3>
                                        {isStepConfirmed && (
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
                                        id="step-name"
                                        label="Nom étape"
                                        placeholder="Nom étape..."
                                        value={stepName}
                                        onChange={(e) => setStepName(e.target.value)}
                                        required
                                        disabled={isStepConfirmed}
                                    />
                                    <TextAreaGroup
                                        id="step-description"
                                        label="Description élément"
                                        placeholder="Description étape..."
                                        value={stepDescription}
                                        onChange={(e) => setStepDescription(e.target.value)}
                                        required
                                        disabled={isStepConfirmed}
                                    />

                                    <div className="flex justify-center gap-4 mt-4">
                                        {!isStepConfirmed ? (
                                            <>
                                                <Button
                                                    type="button"
                                                    onClick={handleConfirmStep}
                                                    className="bg-primary hover:bg-primary-hover px-8 text-white"
                                                >
                                                    Confirmer
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowNewStepForm(false);
                                                        setSelectedStepId("");
                                                        setIsStepConfirmed(false);
                                                    }}
                                                    className="bg-secondary hover:bg-secondary-hover px-8 text-white"
                                                >
                                                    Annuler
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={() => setIsStepConfirmed(false)}
                                                className="bg-background/20 hover:bg-background/30 px-8 text-sm text-text-main"
                                            >
                                                Modifier
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Colonne Droite : Associations */}
                        <div className="flex-1">
                            <SelectGroup
                                id="associate-course"
                                label="Associer le projet à un cours"
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                            >
                                <option value="" disabled>
                                    Sélectionner un cours...
                                </option>
                                {existingCourses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </SelectGroup>

                            <SelectGroup
                                id="associate-step"
                                label="Associer étape"
                                value={selectedStepId}
                                onChange={handleStepChange}
                            >
                                <option value="" disabled>
                                    Choisir étape...
                                </option>
                                {existingSteps.map((step) => (
                                    <option key={step.id} value={step.id}>
                                        {step.name}
                                    </option>
                                ))}
                                <option value="create_new">+ Nouvelle étape</option>
                            </SelectGroup>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-border">
                        <Button
                            type="submit"
                            className={`bg-primary hover:bg-primary-hover px-8 py-2 rounded-full text-white ${showNewStepForm && !isStepConfirmed
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                                }`}
                            disabled={showNewStepForm && !isStepConfirmed}
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

export default ProjectModal;

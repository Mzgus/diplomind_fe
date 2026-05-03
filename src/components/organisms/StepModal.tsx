import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Buttons/Button";
import InputGroup from "../molecules/InputGroup";
import TextAreaGroup from "../molecules/TextAreaGroup";
import SelectGroup from "../molecules/SelectGroup";

interface StepModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (stepData: any, skillData: any | null) => void;
    existingProjects: { id: string; name: string }[];
    existingSkills: { id: string; name: string }[];
    initialData?: any;
}

const StepModal: React.FC<StepModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingProjects,
    existingSkills,
    initialData
}) => {
    // State pour l'étape
    const [stepName, setStepName] = useState("");
    const [stepDescription, setStepDescription] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedSkillId, setSelectedSkillId] = useState("");

    // State pour la nouvelle compétence
    const [showNewSkillForm, setShowNewSkillForm] = useState(false);
    const [skillName, setSkillName] = useState("");
    const [skillDescription, setSkillDescription] = useState("");
    const [isSkillConfirmed, setIsSkillConfirmed] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setStepName(initialData.name);
                setStepDescription(initialData.description || "");
                setSelectedProjectId(initialData.project_id ? initialData.project_id.toString() : "");
                // Skill prefill? Step might be linked to skills. 
                // But this modal logic seems to be about CREATING a new skill or linking existing (singular?).
                // Steps to Skills is Many-to-Many via `step_skills`.
                // For now reset skill form as we likely manage links in `StepAssociationModal` (inverse of this?).
                setSelectedSkillId("");
                setShowNewSkillForm(false);
            } else {
                setStepName("");
                setStepDescription("");
                setSelectedProjectId("");
                setSelectedSkillId("");
                setShowNewSkillForm(false);
            }
            setSkillName("");
            setSkillDescription("");
            setIsSkillConfirmed(false);
        }
    }, [isOpen, initialData]);

    const handleSkillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedSkillId(value);
        if (value === "create_new") {
            setShowNewSkillForm(true);
            setIsSkillConfirmed(false);
        } else {
            setShowNewSkillForm(false);
            setIsSkillConfirmed(true);
        }
    };

    const handleConfirmSkill = () => {
        if (skillName.trim() && skillDescription.trim()) {
            setIsSkillConfirmed(true);
        } else {
            alert("Veuillez remplir tous les champs de la compétence.");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (showNewSkillForm && !isSkillConfirmed) {
            alert("Veuillez confirmer la création de la compétence avant de continuer.");
            return;
        }

        const stepData = {
            id: initialData?.id,
            name: stepName,
            description: stepDescription,
            projectId: selectedProjectId,
        };
        const skillData = showNewSkillForm
            ? { name: skillName, description: skillDescription }
            : selectedSkillId
                ? { id: selectedSkillId }
                : null;

        onSave(stepData, skillData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-5xl rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-0">
                    <h2 className="text-2xl font-bold">
                        {initialData ? "Éditer l'étape" : "Créer une nouvelle étape"}
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
                        {/* Colonne Gauche : Info Étape + Sous-formulaire Compétence */}
                        <div className="flex-1">
                            <InputGroup
                                id="step-name"
                                label="Nom étape"
                                placeholder="Nom étape..."
                                value={stepName}
                                onChange={(e) => setStepName(e.target.value)}
                                required
                            />
                            <TextAreaGroup
                                id="step-description"
                                label="Description étape"
                                placeholder="Description étape..."
                                value={stepDescription}
                                onChange={(e) => setStepDescription(e.target.value)}
                                required
                            />

                            {/* Panneau Nouvelle Compétence */}
                            {showNewSkillForm && (
                                <div
                                    className={`mt-6 bg-background rounded-xl p-6 shadow-inner animate-fade-in transition-all duration-300 ${isSkillConfirmed
                                        ? "opacity-75 border-2 border-success-border"
                                        : ""
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-text-main">
                                            Création d'une compétence
                                        </h3>
                                        {isSkillConfirmed && (
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
                                        id="skill-name"
                                        label="Nom compétence"
                                        placeholder="Nom compétence..."
                                        value={skillName}
                                        onChange={(e) => setSkillName(e.target.value)}
                                        required
                                        disabled={isSkillConfirmed}
                                    />
                                    <TextAreaGroup
                                        id="skill-description"
                                        label="Description compétence"
                                        placeholder="Description compétence..."
                                        value={skillDescription}
                                        onChange={(e) => setSkillDescription(e.target.value)}
                                        required
                                        disabled={isSkillConfirmed}
                                    />

                                    <div className="flex justify-center gap-4 mt-4">
                                        {!isSkillConfirmed ? (
                                            <>
                                                <Button
                                                    type="button"
                                                    onClick={handleConfirmSkill}
                                                    className="bg-primary hover:bg-primary-hover px-8 text-white"
                                                >
                                                    Confirmer
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowNewSkillForm(false);
                                                        setSelectedSkillId("");
                                                        setIsSkillConfirmed(false);
                                                    }}
                                                    className="bg-secondary hover:bg-secondary-hover px-8 text-white"
                                                >
                                                    Annuler
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={() => setIsSkillConfirmed(false)}
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
                                id="associate-project"
                                label="Associer au projet"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                            >
                                <option value="" disabled>
                                    Sélectionner un projet...
                                </option>
                                {existingProjects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </SelectGroup>

                            <SelectGroup
                                id="associate-skill"
                                label="Associer compétence"
                                value={selectedSkillId}
                                onChange={handleSkillChange}
                            >
                                <option value="" disabled>
                                    Choisir compétence...
                                </option>
                                {existingSkills.map((skill) => (
                                    <option key={skill.id} value={skill.id}>
                                        {skill.name}
                                    </option>
                                ))}
                                <option value="create_new">+ Nouvelle compétence</option>
                            </SelectGroup>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-border">
                        <Button
                            type="submit"
                            className={`bg-primary hover:bg-primary-hover px-8 py-2 rounded-full text-white ${showNewSkillForm && !isSkillConfirmed
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                                }`}
                            disabled={showNewSkillForm && !isSkillConfirmed}
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

export default StepModal;

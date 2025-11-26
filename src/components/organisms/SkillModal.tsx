import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Button";
import InputGroup from "../molecules/InputGroup";
import TextAreaGroup from "../molecules/TextAreaGroup";
import SelectGroup from "../molecules/SelectGroup";

interface SkillData {
    id?: string;
    name: string;
    description: string;
    courseId: string;
}

interface SkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (skillData: SkillData) => void;
    existingCourses: { id: string; name: string }[];
    existingSteps: { id: string; name: string }[];
    skillToEdit?: SkillData | null;
}

const SkillModal: React.FC<SkillModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingCourses,
    // existingSteps,
    skillToEdit = null,
}) => {
    // State pour la compétence
    const [skillName, setSkillName] = useState("");
    const [skillDescription, setSkillDescription] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState("");

    // Reset or populate state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            if (skillToEdit) {
                // Edit mode - populate with existing data
                setSkillName(skillToEdit.name);
                setSkillDescription(skillToEdit.description);
                setSelectedCourseId(skillToEdit.courseId);
            } else {
                // Create mode - reset fields
                setSkillName("");
                setSkillDescription("");
                setSelectedCourseId("");
            }
        }
    }, [isOpen, skillToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const skillData: SkillData = {
            id: skillToEdit?.id,
            name: skillName,
            description: skillDescription,
            courseId: selectedCourseId,
        };

        onSave(skillData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-5xl rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-0">
                    <h2 className="text-2xl font-bold">
                        {skillToEdit ? "Éditer la compétence" : "Créer une compétence"}
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
                        {/* Colonne Gauche : Info Compétence */}
                        <div className="flex-1">
                            <InputGroup
                                id="skill-name"
                                label="Nom compétence"
                                placeholder="Nom compétence..."
                                value={skillName}
                                onChange={(e) => setSkillName(e.target.value)}
                                required
                            />
                            <TextAreaGroup
                                id="skill-description"
                                label="Description compétence"
                                placeholder="Description compétence..."
                                value={skillDescription}
                                onChange={(e) => setSkillDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* Colonne Droite : Associations */}
                        <div className="flex-1">
                            <SelectGroup
                                id="associate-course"
                                label="Associer à un cours"
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

                            {/* <SelectGroup
                                id="associate-step"
                                label="Associer à une étape"
                                value={selectedStepId}
                                onChange={(e) => setSelectedStepId(e.target.value)}
                            >
                                <option value="" disabled>
                                    Sélectionner une étape...
                                </option>
                                {existingSteps.map((step) => (
                                    <option key={step.id} value={step.id}>
                                        {step.name}
                                    </option>
                                ))}
                            </SelectGroup> */}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-border">
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-hover px-8 py-2 rounded-full text-white"
                        >
                            {skillToEdit ? "Mettre à jour" : "Créer"}
                        </Button>
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-secondary hover:bg-secondary-hover text-white px-8 py-2 rounded-full"
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default SkillModal;

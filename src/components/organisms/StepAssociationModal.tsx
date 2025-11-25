import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Button";
import SelectGroup from "../molecules/SelectGroup";

interface StepAssociationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (associations: { projectId: string; stepId: string }[]) => void;
    skillName: string;
    existingProjects: { id: string; name: string }[];
    existingSteps: { id: string; name: string; projectId: string }[];
}

const StepAssociationModal: React.FC<StepAssociationModalProps> = ({
    isOpen,
    onClose,
    onSave,
    skillName,
    existingProjects,
    existingSteps,
}) => {
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedStepId, setSelectedStepId] = useState("");
    const [associations, setAssociations] = useState<{ projectId: string; stepId: string }[]>([]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSelectedProjectId("");
            setSelectedStepId("");
            setAssociations([]);
        }
    }, [isOpen]);

    // Filter steps based on selected project
    const filteredSteps = selectedProjectId
        ? existingSteps.filter((step) => step.projectId === selectedProjectId)
        : [];

    const handleAddAssociation = () => {
        if (selectedProjectId && selectedStepId) {
            setAssociations([...associations, { projectId: selectedProjectId, stepId: selectedStepId }]);
            setSelectedProjectId("");
            setSelectedStepId("");
        }
    };

    const handleRemoveAssociation = (index: number) => {
        setAssociations(associations.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(associations);
        onClose();
    };

    const getProjectName = (projectId: string) => {
        return existingProjects.find((p) => p.id === projectId)?.name || "";
    };

    const getStepName = (stepId: string) => {
        return existingSteps.find((s) => s.id === stepId)?.name || "";
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-3xl rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-4 border-b border-border">
                    <h2 className="text-2xl font-bold">
                        Lier des étapes à: {skillName}
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
                    {/* Selection Section */}
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <SelectGroup
                                id="select-project"
                                label="Sélectionner un projet"
                                value={selectedProjectId}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    setSelectedProjectId(e.target.value);
                                    setSelectedStepId("");
                                }}
                            >
                                <option value="" disabled>
                                    Choisir un projet...
                                </option>
                                {existingProjects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </SelectGroup>
                        </div>
                        <div className="flex-1">
                            <SelectGroup
                                id="select-step"
                                label="Sélectionner une étape"
                                value={selectedStepId}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStepId(e.target.value)}
                                disabled={!selectedProjectId}
                            >
                                <option value="" disabled>
                                    {selectedProjectId ? "Choisir une étape..." : "Sélectionnez d'abord un projet"}
                                </option>
                                {filteredSteps.map((step) => (
                                    <option key={step.id} value={step.id}>
                                        {step.name}
                                    </option>
                                ))}
                            </SelectGroup>
                        </div>
                        <Button
                            type="button"
                            onClick={handleAddAssociation}
                            disabled={!selectedProjectId || !selectedStepId}
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Ajouter
                        </Button>
                    </div>

                    {/* Added Associations */}
                    {associations.length > 0 && (
                        <div className="border border-border rounded-lg p-4">
                            <h3 className="font-semibold mb-3 text-text-main">Étapes à lier:</h3>
                            <ul className="space-y-2">
                                {associations.map((assoc, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between items-center bg-background p-3 rounded-lg"
                                    >
                                        <span className="text-text-main">
                                            {getProjectName(assoc.projectId)} - {getStepName(assoc.stepId)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAssociation(index)}
                                            className="text-danger-text hover:text-danger-border"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-border">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-secondary hover:bg-secondary-hover text-white px-8 py-2 rounded-full"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={associations.length === 0}
                            className="bg-primary hover:bg-primary-hover px-8 py-2 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Valider ({associations.length})
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default StepAssociationModal;

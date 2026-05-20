import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Buttons/Button";
import InputGroup from "../molecules/InputGroup";
import TextAreaGroup from "../molecules/TextAreaGroup";

interface StepModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (stepData: { id?: number; name: string; description: string; projectId?: number; order: number }) => void;
    initialData?: { id?: number; name?: string; description?: string; project_id?: number; step_order?: number } | null;
}

const StepModal: React.FC<StepModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
}) => {
    const [stepName, setStepName] = useState("");
    const [stepDescription, setStepDescription] = useState("");
    const [stepOrder, setStepOrder] = useState(1);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setStepName(initialData.name ?? "");
                setStepDescription(initialData.description ?? "");
                setStepOrder(initialData.step_order ?? 1);
            } else {
                setStepName("");
                setStepDescription("");
                setStepOrder(1);
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: initialData?.id,
            name: stepName,
            description: stepDescription,
            projectId: initialData?.project_id,
            order: stepOrder,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-lg rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-0">
                    <h2 className="text-2xl font-bold">
                        {initialData?.id ? "Éditer l'étape" : "Créer une nouvelle étape"}
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
                        id="step-name"
                        label="Nom de l'étape"
                        placeholder="Ex : Réaliser la maquette Figma"
                        value={stepName}
                        onChange={(e) => setStepName(e.target.value)}
                        required
                    />
                    <TextAreaGroup
                        id="step-description"
                        label="Description"
                        placeholder="Description de l'étape..."
                        value={stepDescription}
                        onChange={(e) => setStepDescription(e.target.value)}
                        required
                    />
                    <div className="flex flex-col gap-1">
                        <label htmlFor="step-order" className="text-sm font-medium text-text-main">
                            Ordre
                        </label>
                        <input
                            id="step-order"
                            type="number"
                            min={1}
                            value={stepOrder}
                            onChange={(e) => setStepOrder(Math.max(1, Number(e.target.value)))}
                            className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </div>

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

export default StepModal;

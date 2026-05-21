import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Buttons/Button";
import InputGroup from "../molecules/InputGroup";
import TextAreaGroup from "../molecules/TextAreaGroup";

interface SkillItem {
    id: number;
    name: string;
    description?: string;
}

interface SkillStepAssociationModalProps {
    isOpen: boolean;
    onClose: () => void;
    stepName: string;
    courseId: number;
    availableSkills: SkillItem[];
    currentSkillIds: number[];
    onSave: (skillIds: number[]) => void;
    onCreateSkill: (name: string, description: string, courseId: number) => Promise<number | null>;
}

const SkillStepAssociationModal: React.FC<SkillStepAssociationModalProps> = ({
    isOpen,
    onClose,
    stepName,
    courseId,
    availableSkills,
    currentSkillIds,
    onSave,
    onCreateSkill,
}) => {
    const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillDescription, setNewSkillDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (isOpen) {
            setSelectedSkillIds([...currentSkillIds]);
            setNewSkillName("");
            setNewSkillDescription("");
            setIsCreating(false);
            setSearchQuery("");
        }
    }, [isOpen, currentSkillIds]);

    const handleToggleSkill = (skillId: number) => {
        if (selectedSkillIds.includes(skillId)) {
            setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skillId));
        } else {
            setSelectedSkillIds([...selectedSkillIds, skillId]);
        }
    };

    const handleCreateSkill = async () => {
        if (!newSkillName.trim()) return;
        setIsCreating(true);
        try {
            const newId = await onCreateSkill(newSkillName.trim(), newSkillDescription.trim(), courseId);
            if (newId) {
                setSelectedSkillIds((prev) => [...prev, newId]);
                setNewSkillName("");
                setNewSkillDescription("");
            }
        } catch (err) {
            console.error("Failed to create skill", err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(selectedSkillIds);
        onClose();
    };

    const getSkillName = (skillId: number) =>
        availableSkills.find((s) => s.id === skillId)?.name || "Compétence inconnue";

    const filteredSkills = availableSkills.filter(
        (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.description ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-6xl rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-4 border-b border-border">
                    <div>
                        <h2 className="text-2xl font-bold">Compétences de l'étape</h2>
                        <p className="text-sm text-text-muted mt-1">Étape : <span className="font-semibold text-text-main">{stepName}</span></p>
                    </div>
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
                    {/* Two-column layout */}
                    <div className="flex gap-6">
                        {/* Left — Available skills list */}
                        <div className="flex-1">
                            <div className="border border-border rounded-lg overflow-hidden flex flex-col h-[440px]">
                                <div className="p-3 border-b border-border bg-background">
                                    <h3 className="font-semibold text-text-main mb-2">Compétences disponibles</h3>
                                    {/* Search */}
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Rechercher une compétence..."
                                        className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {filteredSkills.length === 0 ? (
                                        <div className="p-4 text-text-muted italic text-sm text-center">
                                            Aucune compétence disponible dans ce cours.
                                        </div>
                                    ) : (
                                        filteredSkills.map((skill) => {
                                            const isSelected = selectedSkillIds.includes(skill.id);
                                            return (
                                                <label
                                                    key={skill.id}
                                                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-b-0 ${
                                                        isSelected ? "bg-primary/5" : "hover:bg-background"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleSkill(skill.id)}
                                                        className="mt-0.5 h-4 w-4 text-primary rounded focus:ring-primary flex-shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`font-medium text-sm ${isSelected ? "text-primary" : "text-text-main"}`}>
                                                            {skill.name}
                                                        </div>
                                                        {skill.description && (
                                                            <div className="text-xs text-text-muted mt-0.5 truncate">
                                                                {skill.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isSelected && (
                                                        <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1.5" />
                                                    )}
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right — Create new skill */}
                        <div className="flex-1">
                            <div className="border border-border rounded-lg bg-background h-[440px] flex flex-col overflow-hidden">
                                <div className="p-4 border-b border-border">
                                    <h3 className="font-semibold text-text-main">Créer une nouvelle compétence</h3>
                                    <p className="text-xs text-text-muted mt-0.5">Elle sera ajoutée au cours et cochée automatiquement.</p>
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto">
                                    <InputGroup
                                        id="new-skill-name"
                                        label="Nom de la compétence"
                                        placeholder="Ex: Maîtriser les bases de React..."
                                        value={newSkillName}
                                        onChange={(e) => setNewSkillName(e.target.value)}
                                    />
                                    <TextAreaGroup
                                        id="new-skill-description"
                                        label="Description"
                                        placeholder="Description de la compétence..."
                                        value={newSkillDescription}
                                        onChange={(e) => setNewSkillDescription(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2 p-4 border-t border-border">
                                    <Button
                                        type="button"
                                        onClick={handleCreateSkill}
                                        disabled={isCreating || !newSkillName.trim()}
                                        className="flex-1 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-full disabled:opacity-50"
                                    >
                                        {isCreating ? "Création..." : "Créer et cocher"}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => { setNewSkillName(""); setNewSkillDescription(""); }}
                                        className="flex-1 bg-secondary hover:bg-secondary-hover text-white px-4 py-2 rounded-full"
                                    >
                                        Vider
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selected skills summary */}
                    {selectedSkillIds.length > 0 && (
                        <div className="border border-primary/30 bg-primary/5 rounded-lg p-4">
                            <h3 className="font-semibold mb-2 text-text-main text-sm">
                                Compétences sélectionnées : {selectedSkillIds.length}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedSkillIds.map((skillId) => (
                                    <span
                                        key={skillId}
                                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm"
                                    >
                                        <span className="text-text-main font-medium">{getSkillName(skillId)}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleSkill(skillId)}
                                            className="text-text-muted hover:text-danger-text transition-colors"
                                        >
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-4 pt-2 border-t border-border">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-secondary hover:bg-secondary-hover text-white px-8 py-2 rounded-full"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-hover px-8 py-2 rounded-full text-white"
                        >
                            Valider ({selectedSkillIds.length})
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default SkillStepAssociationModal;

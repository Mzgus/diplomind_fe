import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Buttons/Button";
import InputGroup from "../molecules/InputGroup";
import TextAreaGroup from "../molecules/TextAreaGroup";

interface ProjectAssociationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (projectIds: string[]) => void;
    courseName: string;
    existingProjects: { id: string; name: string; description: string }[];
    currentProjectIds?: string[];
    onCreateProject?: (name: string, description: string) => Promise<string | null>;
}

const ProjectAssociationModal: React.FC<ProjectAssociationModalProps> = ({
    isOpen,
    onClose,
    onSave,
    courseName,
    existingProjects,
    currentProjectIds = [],
    onCreateProject
}) => {
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSelectedProjectIds([...currentProjectIds]);
            setNewProjectName("");
            setNewProjectDescription("");
            setIsCreating(false);
        }
    }, [isOpen, currentProjectIds]);

    const handleToggleProject = (projectId: string) => {
        if (selectedProjectIds.includes(projectId)) {
            setSelectedProjectIds(selectedProjectIds.filter(id => id !== projectId));
        } else {
            setSelectedProjectIds([...selectedProjectIds, projectId]);
        }
    };

    const handleAddNewProject = async () => {
        if (newProjectName.trim() && newProjectDescription.trim() && onCreateProject) {
            setIsCreating(true);
            try {
                const newId = await onCreateProject(newProjectName, newProjectDescription);
                if (newId) {
                    setSelectedProjectIds(prev => [...prev, newId]);
                    setNewProjectName("");
                    setNewProjectDescription("");
                }
            } catch (error) {
                console.error("Failed to create project inside modal", error);
            } finally {
                setIsCreating(false);
            }
        } else if (!onCreateProject) {
             console.warn("onCreateProject prop not provided");
        } else {
            alert("Veuillez remplir tous les champs du projet.");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(selectedProjectIds);
        onClose();
    };

    const getProjectName = (projectId: string) => {
        return existingProjects.find((p) => p.id === projectId)?.name || "";
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-6xl rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-4 border-b border-border">
                    <h2 className="text-2xl font-bold">
                        Lier des projets à: {courseName}
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
                    {/* Two Column Layout */}
                    <div className="flex gap-6">
                        {/* Left Column: Projects List */}
                        <div className="flex-1">
                            <div className="border border-border rounded-lg p-4 h-[500px] overflow-y-auto">
                                <h3 className="font-semibold mb-3 text-text-main">Projets disponibles:</h3>
                                <div className="space-y-2">
                                    {existingProjects.map((project) => (
                                        <label
                                            key={project.id}
                                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-background cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedProjectIds.includes(project.id)}
                                                onChange={() => handleToggleProject(project.id)}
                                                className="mt-1 h-5 w-5 text-primary rounded focus:ring-primary"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-text-main">{project.name}</div>
                                                <div className="text-sm text-text-muted">{project.description}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: New Project Form */}
                        <div className="flex-1">
                            <div className="border border-border rounded-lg p-4 bg-background h-[500px] flex flex-col">
                                <h3 className="font-semibold text-text-main mb-3">Créer un nouveau projet</h3>
                                <div className="flex-1 overflow-y-auto px-1">
                                    <InputGroup
                                        id="new-project-name"
                                        label="Nom du projet"
                                        placeholder="Nom du projet..."
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                    />
                                    <TextAreaGroup
                                        id="new-project-description"
                                        label="Description du projet"
                                        placeholder="Description du projet..."
                                        value={newProjectDescription}
                                        onChange={(e) => setNewProjectDescription(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                                    <Button
                                        type="button"
                                        onClick={handleAddNewProject}
                                        className="flex-1 bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full"
                                        disabled={isCreating}
                                    >
                                        {isCreating ? "Création..." : "Ajouter le projet"}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setNewProjectName("");
                                            setNewProjectDescription("");
                                        }}
                                        className="flex-1 bg-secondary hover:bg-secondary-hover text-white px-6 py-2 rounded-full"
                                    >
                                        Réinitialiser
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selected Projects Summary */}
                    {selectedProjectIds.length > 0 && (
                        <div className="border border-primary/30 bg-primary/5 rounded-lg p-4">
                            <h3 className="font-semibold mb-2 text-text-main">
                                Projets sélectionnés: {selectedProjectIds.length}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedProjectIds.map((projectId) => (
                                    <span
                                        key={projectId}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-sm"
                                    >
                                        <span className="text-text-main font-medium">
                                            {getProjectName(projectId) || "Nouveau projet"}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-border">
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
                            Valider ({selectedProjectIds.length})
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ProjectAssociationModal;

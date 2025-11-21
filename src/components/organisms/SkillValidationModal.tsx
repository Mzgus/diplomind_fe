import React, { useState, useEffect } from "react";

interface SkillValidationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (status: string, comment: string) => void;
    studentName: string;
    skillName: string;
    skillDescription: string;
    initialStatus?: string;
    initialComment?: string;
}

const SkillValidationModal: React.FC<SkillValidationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    studentName,
    skillName,
    skillDescription,
    initialStatus = "Non évalué",
    initialComment = "",
}) => {
    const [status, setStatus] = useState(initialStatus);
    const [comment, setComment] = useState(initialComment);

    useEffect(() => {
        if (isOpen) {
            setStatus(initialStatus || "Non évalué");
            setComment(initialComment || "");
        }
    }, [isOpen, initialStatus, initialComment]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(status, comment);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm p-4 md:p-0">
            <div className="relative w-full max-w-md max-h-full rounded-lg bg-surface shadow-xl ring-1 ring-border">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border p-4 md:p-5 rounded-t-lg">
                    <div>
                        <h3 className="text-xl font-semibold text-text-main">
                            Valider la compétence
                        </h3>
                        <p className="text-sm text-text-muted mt-1">
                            Étudiant : <span className="font-medium text-text-main">{studentName}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-text-muted hover:bg-background hover:text-text-main"
                    >
                        <svg
                            className="h-3 w-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 14"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                        </svg>
                        <span className="sr-only">Fermer</span>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-4 md:p-5 space-y-4">
                    <div className="bg-primary/10 p-3 rounded-md border border-primary/20">
                        <h4 className="font-medium text-primary text-sm mb-1">{skillName}</h4>
                        <p className="text-text-main text-xs">{skillDescription}</p>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-text-main">
                            Statut de validation
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {["Validé", "Partiellement validé", "Non validé", "Non évalué"].map((option) => (
                                <label
                                    key={option}
                                    className={`flex items-center justify-between p-3 text-text-main bg-surface border rounded-lg cursor-pointer hover:bg-background ${status === option ? "border-primary ring-1 ring-primary bg-primary/10" : "border-border"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            name="status"
                                            value={option}
                                            checked={status === option}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-4 h-4 text-primary bg-background border-border focus:ring-primary"
                                        />
                                        <span className="w-full ms-2 text-sm font-medium rounded text-text-main">
                                            {option}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="comment" className="block mb-2 text-sm font-medium text-text-main">
                            Commentaire (optionnel)
                        </label>
                        <textarea
                            id="comment"
                            rows={4}
                            className="block p-2.5 w-full text-sm text-text-main bg-background rounded-lg border border-border focus:ring-primary focus:border-primary"
                            placeholder="Ajouter un commentaire sur la validation..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-border rounded-b">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-2.5 px-5 text-sm font-medium text-white focus:outline-none bg-secondary rounded-lg border border-secondary hover:bg-secondary-hover focus:z-10 focus:ring-4 focus:ring-secondary/30"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="text-white bg-primary hover:bg-primary-hover focus:ring-4 focus:outline-none focus:ring-primary/30 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SkillValidationModal;

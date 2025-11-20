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
            <div className="relative w-full max-w-md max-h-full rounded-lg bg-white shadow-xl ring-1 ring-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4 md:p-5 rounded-t-lg">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                            Valider la compétence
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Étudiant : <span className="font-medium text-gray-900">{studentName}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
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
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                        <h4 className="font-medium text-blue-900 text-sm mb-1">{skillName}</h4>
                        <p className="text-blue-700 text-xs">{skillDescription}</p>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                            Statut de validation
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {["Validé", "Partiellement validé", "Non validé", "Non évalué"].map((option) => (
                                <label
                                    key={option}
                                    className={`flex items-center justify-between p-3 text-gray-900 bg-white border rounded-lg cursor-pointer hover:bg-gray-50 ${status === option ? "border-blue-600 ring-1 ring-blue-600 bg-blue-50/50" : "border-gray-200"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            name="status"
                                            value={option}
                                            checked={status === option}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="w-full ms-2 text-sm font-medium rounded dark:text-gray-300">
                                            {option}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="comment" className="block mb-2 text-sm font-medium text-gray-900">
                            Commentaire (optionnel)
                        </label>
                        <textarea
                            id="comment"
                            rows={4}
                            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ajouter un commentaire sur la validation..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 rounded-b">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
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

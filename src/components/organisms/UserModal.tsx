import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Buttons/Button";
import InputGroup from "../molecules/InputGroup";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (userData: any) => void;
    initialData?: any;
}

const UserModal: React.FC<UserModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData
}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setEmail(initialData.email || "");
                setPassword("");
            } else {
                setEmail("");
                setPassword("");
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ email, password });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-lg rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold">
                        {initialData ? "Modifier le compte" : "Créer un compte"}
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

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    <InputGroup
                        id="user-email"
                        label="Adresse email"
                        type="email"
                        placeholder="Ex: jean.dupont@diplomind.fr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    
                    <InputGroup
                        id="user-password"
                        label={initialData ? "Nouveau mot de passe (laisser vide pour ne pas modifier)" : "Mot de passe"}
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={!initialData}
                    />

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-secondary hover:bg-secondary-hover px-5 py-2 text-white font-medium"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-hover px-5 py-2 text-white font-medium"
                        >
                            Confirmer
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default UserModal;

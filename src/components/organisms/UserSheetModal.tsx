import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Button";
import InputGroup from "../molecules/InputGroup";
import SelectGroup from "../molecules/SelectGroup";

interface UserSheetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sheetData: any, userData: any | null) => void;
    existingClasses: { id: string; name: string }[];
    existingUsers: { id: string; name: string }[];
}

const UserSheetModal: React.FC<UserSheetModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingClasses,
    existingUsers,
}) => {
    // State pour la fiche utilisateur
    const [sheetName, setSheetName] = useState("");
    const [sheetType, setSheetType] = useState("");
    const [sheetFirstName, setSheetFirstName] = useState("");
    const [sheetLastName, setSheetLastName] = useState("");
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");

    // State pour le nouvel utilisateur
    const [showNewUserForm, setShowNewUserForm] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [isUserConfirmed, setIsUserConfirmed] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSheetName("");
            setSheetType("");
            setSelectedClassId("");
            setSelectedUserId("");
            setShowNewUserForm(false);
            setUserEmail("");
            setUserPassword("");
            setIsUserConfirmed(false);
        }
    }, [isOpen]);

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedUserId(value);
        if (value === "create_new") {
            setShowNewUserForm(true);
            setIsUserConfirmed(false);
        } else {
            setShowNewUserForm(false);
            setIsUserConfirmed(true);
        }
    };

    const handleConfirmUser = () => {
        if (userEmail.trim() && userPassword.trim()) {
            setIsUserConfirmed(true);
        } else {
            alert("Veuillez remplir tous les champs de l'utilisateur.");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (showNewUserForm && !isUserConfirmed) {
            alert("Veuillez confirmer la création de l'utilisateur avant de continuer.");
            return;
        }

        const sheetData = {
            name: sheetName,
            type: sheetType,
            classId: selectedClassId,
        };
        const userData = showNewUserForm
            ? { email: userEmail, password: userPassword }
            : selectedUserId
                ? { id: selectedUserId }
                : null;

        onSave(sheetData, userData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-5xl rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-0">
                    <h2 className="text-2xl font-bold">
                        Formulaire de création / édition de fiche utilisateur
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
                        {/* Colonne Gauche : Info Fiche */}
                        <div className="flex-1">
                            <div className="flex flex-inline gap-4">
                                <InputGroup
                                    id="sheet-first-name"
                                    label="Prénom"
                                    placeholder="Prénom..."
                                    value={sheetFirstName}
                                    onChange={(e) => setSheetFirstName(e.target.value)}
                                    required
                                />
                                <InputGroup
                                    id="sheet-last-name"
                                    label="Nom"
                                    placeholder="Nom..."
                                    value={sheetLastName}
                                    onChange={(e) => setSheetLastName(e.target.value)}
                                    required
                                />
                            </div>
                            <SelectGroup
                                id="sheet-type"
                                label="Type de fiche"
                                value={sheetType}
                                onChange={(e) => setSheetType(e.target.value)}
                            >
                                <option value="" disabled>
                                    Type fiche...
                                </option>
                                <option value="eleve">Elève</option>
                                <option value="professeur">Professeur</option>
                                <option value="admin">Admin</option>
                            </SelectGroup>

                            {/* Panneau Nouveau Utilisateur */}
                            {showNewUserForm && (
                                <div
                                    className={`mt-6 bg-background rounded-xl p-6 shadow-inner animate-fade-in transition-all duration-300 border border-border ${isUserConfirmed
                                        ? "opacity-75 border-success-border"
                                        : ""
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-text-main">
                                            Création d'un utilisateur
                                        </h3>
                                        {isUserConfirmed && (
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
                                        id="user-email"
                                        label="Email"
                                        placeholder="email..."
                                        value={userEmail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        required
                                        disabled={isUserConfirmed}
                                    />
                                    <InputGroup
                                        id="user-password"
                                        label="Mot de passe"
                                        type="password"
                                        placeholder="Mot de passe..."
                                        value={userPassword}
                                        onChange={(e) => setUserPassword(e.target.value)}
                                        required
                                        disabled={isUserConfirmed}
                                    />

                                    <div className="flex justify-center gap-4 mt-4">
                                        {!isUserConfirmed ? (
                                            <>
                                                <Button
                                                    type="button"
                                                    onClick={handleConfirmUser}
                                                    className="bg-primary hover:bg-primary-hover text-white px-8"
                                                >
                                                    Confirmer
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowNewUserForm(false);
                                                        setSelectedUserId("");
                                                        setIsUserConfirmed(false);
                                                    }}
                                                    className="bg-secondary hover:bg-secondary-hover text-white px-8"
                                                >
                                                    Annuler
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={() => setIsUserConfirmed(false)}
                                                className="bg-surface hover:bg-background border border-border px-8 text-sm text-text-main"
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
                                id="associate-class"
                                label="Associer une classe"
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                            >
                                <option value="" disabled>
                                    Choisir classe...
                                </option>
                                {existingClasses.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </SelectGroup>

                            <SelectGroup
                                id="associate-user"
                                label="Associer utilisateur à la fiche"
                                value={selectedUserId}
                                onChange={handleUserChange}
                            >
                                <option value="" disabled>
                                    Choisir utilisateur...
                                </option>
                                {existingUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                                <option value="create_new">+ Nouvelle utilisateur</option>
                            </SelectGroup>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-border">
                        <Button
                            type="submit"
                            className={`bg-primary hover:bg-primary-hover text-white px-8 py-2 rounded-full ${showNewUserForm && !isUserConfirmed
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                                }`}
                            disabled={showNewUserForm && !isUserConfirmed}
                        >
                            Confirmer
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

export default UserSheetModal;

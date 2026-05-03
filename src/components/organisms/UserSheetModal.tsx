import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Buttons/Button";
import InputGroup from "../molecules/InputGroup";
import SelectGroup from "../molecules/SelectGroup";

interface UserSheetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sheetData: any, userData: any | null) => void;
    existingClasses: { id: number; name: string }[];
    existingUsers: { id: number; name: string }[];
    initialData?: any; // For editing if needed
}

const UserSheetModal: React.FC<UserSheetModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingClasses,
    existingUsers,
    initialData
}) => {
    // State pour la fiche utilisateur
    const [sheetType, setSheetType] = useState("student");
    const [sheetFirstName, setSheetFirstName] = useState("");
    const [sheetLastName, setSheetLastName] = useState("");
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [isActive, setIsActive] = useState(true);

    // State pour le nouvel utilisateur
    const [showNewUserForm, setShowNewUserForm] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [isUserConfirmed, setIsUserConfirmed] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setSheetLastName(initialData.last_name || "");
                setSheetFirstName(initialData.first_name || "");
                setSheetType(initialData.type_user || "student");
                // Pre-fill linked account if available
                setSelectedUserId(initialData.account_id ? String(initialData.account_id) : "");
                // Pre-fill linked class if available
                setSelectedClassId(initialData.class_id ? String(initialData.class_id) : "");
                setShowNewUserForm(false);
                setIsUserConfirmed(!!initialData.account_id); // Consider linked if has account
                setIsActive(initialData.active !== false); // Default true if undefined, false if existing inactive
            } else {
                setSheetType("student");
                setSheetFirstName("");
                setSheetLastName("");
                setSelectedClassId("");
                setSelectedUserId("");
                setShowNewUserForm(false);
                setUserEmail("");
                setUserPassword("");
                setIsUserConfirmed(false);
                setIsActive(true);
            }
        }
    }, [isOpen, initialData]);

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
            nom: sheetLastName,
            prenom: sheetFirstName,
            type_user: sheetType,
            classId: selectedClassId ? Number(selectedClassId) : null,
            active: isActive,
        };
        const userData = showNewUserForm
            ? { email: userEmail, password: userPassword }
            : selectedUserId
                ? { id: Number(selectedUserId) }
                : null;

        onSave(sheetData, userData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-5xl rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col border border-border">
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
                        {/* Info Fiche */}
                        <div className="flex-1 space-y-4">
                            <div className="flex gap-4">
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
                                <option key="opt-student" value="student">Elève</option>
                                <option key="opt-teacher" value="teacher">Professeur</option>
                                <option key="opt-admin" value="admin">Admin</option>
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

                                    <div className="flex justify-end gap-4 mt-4">
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

                        {/* Associations */}
                        <div className="flex-1 space-y-4">
                            <SelectGroup
                                id="associate-class"
                                label="Associer une classe"
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                            >
                                <option key="default-class" value="" disabled>
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
                                label="Associer utilisateur (Compte)"
                                value={selectedUserId}
                                onChange={handleUserChange}
                            >
                                <option key="default-user" value="" disabled>
                                    Choisir compte...
                                </option>
                                {existingUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                                <option key="create-new" value="create_new">+ Créer nouveau compte</option>
                            </SelectGroup>

                            <div className="flex items-center gap-2 pt-2">
                                <label htmlFor="sheet-active" className="text-sm font-medium text-text-main">
                                    Fiche Active
                                </label>
                                <button
                                    type="button"
                                    id="sheet-active"
                                    role="switch"
                                    aria-checked={isActive}
                                    onClick={() => setIsActive(!isActive)}
                                    className={`${
                                        isActive ? "bg-primary" : "bg-gray-200"
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                                >
                                    <span
                                        className={`${
                                            isActive ? "translate-x-6" : "translate-x-1"
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </button>
                            </div>
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

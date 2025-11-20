import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Button";
import InputGroup from "../molecules/InputGroup";
import SelectGroup from "../molecules/SelectGroup";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (userData: any, sheetData: any | null) => void;
    existingSheets: { id: string; name: string }[];
}

const UserModal: React.FC<UserModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingSheets,
}) => {
    // State pour l'utilisateur
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [selectedSheetId, setSelectedSheetId] = useState("");

    // State pour la nouvelle fiche
    const [showNewSheetForm, setShowNewSheetForm] = useState(false);
    const [sheetLastName, setSheetLastName] = useState("");
    const [sheetFirstName, setSheetFirstName] = useState("");
    const [sheetType, setSheetType] = useState("eleve");
    const [isSheetConfirmed, setIsSheetConfirmed] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setUserName("");
            setPassword("");
            setSelectedSheetId("");
            setShowNewSheetForm(false);
            setSheetLastName("");
            setSheetFirstName("");
            setSheetType("eleve");
            setIsSheetConfirmed(false);
        }
    }, [isOpen]);

    const handleSheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedSheetId(value);
        if (value === "create_new") {
            setShowNewSheetForm(true);
            setIsSheetConfirmed(false);
        } else {
            setShowNewSheetForm(false);
            setIsSheetConfirmed(true); // Si on sélectionne une fiche existante, c'est valide
        }
    };

    const handleConfirmSheet = () => {
        if (sheetLastName.trim() && sheetFirstName.trim()) {
            setIsSheetConfirmed(true);
            // Optionnel : Feedback visuel ou masquage partiel
        } else {
            alert("Veuillez remplir tous les champs de la fiche utilisateur.");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (showNewSheetForm && !isSheetConfirmed) {
            alert(
                "Veuillez confirmer la création de la fiche utilisateur avant de continuer."
            );
            return;
        }

        const userData = { name: userName, password };
        const sheetData = showNewSheetForm
            ? { lastName: sheetLastName, firstName: sheetFirstName, type: sheetType }
            : null;
        onSave(userData, sheetData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-4xl rounded-xl bg-[#2D525B] text-white shadow-2xl overflow-hidden flex flex-col">
                {/* Header avec bouton fermer */}
                <div className="flex justify-between items-center p-6 pb-0">
                    <h2 className="text-2xl font-bold">
                        Formulaire de création / édition d'un utilisateur
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-300 hover:text-white focus:outline-none"
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
                        {/* Colonne Gauche : Info Utilisateur */}
                        <div className="flex-1">
                            <InputGroup
                                id="user-email"
                                label="Email de l'utilisateur"
                                placeholder="Email de l'utilisateur..."
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                required
                            />
                            <InputGroup
                                id="user-password"
                                label="Mot de passe"
                                type="password"
                                placeholder="Mot de passe..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            {/* Panneau Nouvelle Fiche (Apparition Conditionnelle) */}
                            {showNewSheetForm && (
                                <div
                                    className={`mt-6 bg-[#4DA7C8] rounded-xl p-6 shadow-inner animate-fade-in transition-all duration-300 ${isSheetConfirmed ? "opacity-75 border-2 border-green-400" : ""
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-white">
                                            Création de la fiche utilisateur
                                        </h3>
                                        {isSheetConfirmed && (
                                            <span className="text-green-200 font-bold text-sm flex items-center">
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup
                                            id="sheet-lastname"
                                            label="Nom"
                                            placeholder="Nom..."
                                            value={sheetLastName}
                                            onChange={(e) => setSheetLastName(e.target.value)}
                                            required
                                            disabled={isSheetConfirmed}
                                        />
                                        <SelectGroup
                                            id="sheet-type"
                                            label="Type de fiche"
                                            value={sheetType}
                                            onChange={(e) => setSheetType(e.target.value)}
                                            disabled={isSheetConfirmed}
                                        >
                                            <option value="eleve">Eleve</option>
                                            <option value="professeur">Professeur</option>
                                            <option value="admin">Admin</option>
                                        </SelectGroup>
                                    </div>
                                    <InputGroup
                                        id="sheet-firstname"
                                        label="Prenom"
                                        placeholder="Prenom..."
                                        value={sheetFirstName}
                                        onChange={(e) => setSheetFirstName(e.target.value)}
                                        required
                                        disabled={isSheetConfirmed}
                                    />
                                    <div className="flex justify-center gap-4 mt-4">
                                        {!isSheetConfirmed ? (
                                            <>
                                                <Button
                                                    type="button"
                                                    onClick={handleConfirmSheet}
                                                    className="bg-[#2D6A85] hover:bg-[#24566c] px-8"
                                                >
                                                    Confirmer
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowNewSheetForm(false);
                                                        setSelectedSheetId("");
                                                        setIsSheetConfirmed(false);
                                                    }}
                                                    className="bg-[#2D6A85] hover:bg-[#24566c] px-8"
                                                >
                                                    Annuler
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={() => setIsSheetConfirmed(false)}
                                                className="bg-white/20 hover:bg-white/30 px-8 text-sm"
                                            >
                                                Modifier
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Colonne Droite : Association */}
                        <div className="flex-1">
                            <SelectGroup
                                id="associate-sheet"
                                label="Associer à une fiche"
                                value={selectedSheetId}
                                onChange={handleSheetChange}
                            >
                                <option value="" disabled>
                                    Sélectionner...
                                </option>
                                {existingSheets.map((sheet) => (
                                    <option key={sheet.id} value={sheet.id}>
                                        {sheet.name}
                                    </option>
                                ))}
                                <option value="create_new">+ Nouvelle fiche utilisateur</option>
                            </SelectGroup>

                            {/* Liste visuelle ou info supplémentaire si nécessaire */}
                            {selectedSheetId && selectedSheetId !== "create_new" && (
                                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                                    <p className="text-sm text-gray-200">
                                        Fiche sélectionnée :{" "}
                                        {existingSheets.find((s) => s.id === selectedSheetId)?.name}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions Globales */}
                    <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-white/10">
                        <Button
                            type="submit"
                            className={`bg-[#4DA7C8] hover:bg-[#3b8da6] px-8 py-2 rounded-full ${showNewSheetForm && !isSheetConfirmed
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                                }`}
                            disabled={showNewSheetForm && !isSheetConfirmed}
                        >
                            Confirmer
                        </Button>
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-[#4DA7C8] hover:bg-[#3b8da6] px-8 py-2 rounded-full"
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default UserModal;

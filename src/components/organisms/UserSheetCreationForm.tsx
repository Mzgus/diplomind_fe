import React, { useState } from "react";
import FormField from "../molecules/FormField";
import Button from "../atoms/Button";
import Dropdown from "../molecules/Dropdown";

interface UserSheetCreationData {
  name: string;
  role: string;
  classId: string;
  userId: string;
}

interface UserSheetCreationFormProps {
  onClose: () => void;
  onSubmit: (data: UserSheetCreationData) => void;
}

// Données fictives pour les menus déroulants
const roleOptions = [
  { value: "student", label: "Élève" },
  { value: "teacher", label: "Professeur" },
  { value: "admin", label: "Admin" },
];

const classOptions = [
  { value: "class-1", label: "Développeur Web - 2024" },
  { value: "class-2", label: "Designer UI/UX - 2024" },
  { value: "class-3", label: "Chef de Projet Digital - 2023" },
];

const userOptions = [
  { value: "user-1", label: "Alice Martin" },
  { value: "user-2", label: "Bob Garcia" },
  { value: "user-3", label: "Charlie Brown" },
];

const UserSheetCreationForm: React.FC<UserSheetCreationFormProps> = ({
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string[]>([]); // Doit être single-select
  const [selectedUser, setSelectedUser] = useState<string[]>([]);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData: UserSheetCreationData = {
      name,
      role: selectedRole[0],
      classId: selectedClass[0],
      userId: isCreatingUser ? newUserEmail : selectedUser[0],
    };
    if (isCreatingUser) {
      // Logique de création d'utilisateur simulée
      console.log("Création d'un nouvel utilisateur:", {
        email: newUserEmail,
        password: newUserPassword,
      });
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-xl bg-[#2D525B] p-8 shadow-lg text-white"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">
        Créer une nouvelle fiche utilisateur
      </h2>
      <div className="grid grid-cols-2 gap-25">
        {/* Colonne de gauche */}
        <div className="flex flex-col space-y-4">
          <FormField
            label="Nom de la fiche :"
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Dropdown
            label="Rôle :"
            options={roleOptions}
            selectedValues={selectedRole}
            onChange={setSelectedRole}
            placeholder="Sélectionner un rôle"
            itemName="rôle"
          />
          {isCreatingUser && (
            <div className="border-t border-gray-500 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-3">
                Créer un nouvel utilisateur
              </h3>
              <FormField
                label="Email :"
                type="email"
                id="newUserEmail"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
              />
              <FormField
                label="Mot de passe :"
                type="password"
                id="newUserPassword"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
              />
            </div>
          )}
          {isCreatingUser && (
            <div className="flex justify-end gap-4 mt-4">
              <Button
                type="button"
                onClick={() => setIsCreatingUser(false)}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Annuler
              </Button>
              <Button type="button" className="bg-[#277da1] hover:bg-[#216b8a]">
                Valider
              </Button>
            </div>
          )}
        </div>
        {/* Colonne de droite */}
        <div className="flex flex-col space-y-4">
          <Dropdown
            label="Associer une classe :"
            options={classOptions}
            selectedValues={selectedClass}
            onChange={setSelectedClass}
            disabled={isCreatingUser}
            placeholder="Sélectionner une classe"
            itemName="classe"
          />
          <div>
            <Dropdown
              label="Associer un utilisateur :"
              options={userOptions}
              selectedValues={selectedUser}
              onChange={(value) => {
                setSelectedUser(value);
                if (isCreatingUser) setIsCreatingUser(false);
              }}
              placeholder="Sélectionner un utilisateur"
              itemName="utilisateur"
              disabled={isCreatingUser}
            />
            {!isCreatingUser && (
              <button
                type="button"
                onClick={() => setIsCreatingUser(true)}
                className="text-sm text-[#4DA7C8] hover:text-white mt-2"
              >
                + Créer un nouvel utilisateur
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-8">
        <Button
          type="button"
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600"
        >
          Annuler
        </Button>
        <Button type="submit" className="bg-[#277da1] hover:bg-[#216b8a]">
          Créer la fiche
        </Button>
      </div>
    </form>
  );
};

export default UserSheetCreationForm;

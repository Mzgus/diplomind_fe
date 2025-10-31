import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import FormModal from "../components/organisms/FormModal";
import FormField from "../components/molecules/FormField";
import Select from "../components/atoms/Select";
import Label from "../components/atoms/Label";

// Données et colonnes fictives pour l'exemple
const userColumns = [
  { key: "name", header: "Nom" },
  { key: "email", header: "Email" },
  { key: "role", header: "Rôle" },
  { key: "status", header: "Statut" },
];

const userData = [
  {
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    role: "Admin",
    status: "Actif",
  },
  {
    name: "Marie Curie",
    email: "marie.curie@example.com",
    role: "Utilisateur",
    status: "Actif",
  },
  {
    name: "Pierre Martin",
    email: "pierre.martin@example.com",
    role: "Utilisateur",
    status: "Inactif",
  },
  {
    name: "Sophie Lambert",
    email: "sophie.lambert@example.com",
    role: "Editeur",
    status: "Actif",
  },
];

const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Données fictives pour les fiches utilisateur existantes
  const existingUserSheets = [
    { id: "1", name: "Fiche de Alice Martin" },
    { id: "2", name: "Fiche de Bob Garcia" },
  ];

  // State pour la modale de création
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    password: "",
  });
  const [selectedSheetId, setSelectedSheetId] = useState<string>("");
  const [showNewSheetForm, setShowNewSheetForm] = useState(false);
  const [newSheetData, setNewSheetData] = useState({
    lastName: "",
    firstName: "",
    type: "eleve",
  });

  const handleSheetSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSheetId(value);
    setShowNewSheetForm(value === "create_new");
  };

  // State pour la modale de suppression
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Record<string, any> | null>(
    null
  );

  const handleOpenDeleteModal = (user: Record<string, any>) => {
    setItemToDelete(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = () => {
    console.log("Suppression confirmée pour:", itemToDelete?.name);
    handleCloseModal();
  };

  const handleSaveNewUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Sauvegarde du nouvel utilisateur:", {
      ...newUser,
      sheetId: selectedSheetId,
      newSheet: showNewSheetForm ? newSheetData : null,
    });
    setIsCreateModalOpen(false);
    // Réinitialiser les états
    setNewUser({ name: "", password: "" });
    setSelectedSheetId("");
    setShowNewSheetForm(false);
  };

  // Logique de filtrage (sera utile plus tard)
  const filteredUsers = userData.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageLayout
        title="Utilisateurs"
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Rechercher un utilisateur..."
        buttonText="Ajouter un utilisateur"
        onButtonClick={() => setIsCreateModalOpen(true)}
        columns={userColumns}
        data={filteredUsers}
        onDeleteRow={handleOpenDeleteModal}
      />
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ""}
        itemType="l'utilisateur"
      />
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewUser}
        title="Créer un nouvel utilisateur"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {/* --- Colonne de gauche --- */}
          <div>
            <FormField
              label="Nom de l'utilisateur"
              type="text"
              id="new-user-name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            <FormField
              label="Mot de passe"
              type="password"
              id="new-user-password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              required
            />
            {/* Formulaire de création de fiche qui apparaît conditionnellement */}
            {showNewSheetForm && (
              <div className="mt-6 border-t border-gray-500 pt-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Nouvelle fiche utilisateur
                </h4>
                <FormField
                  label="Nom"
                  type="text"
                  id="new-sheet-lastname"
                  value={newSheetData.lastName}
                  onChange={(e) =>
                    setNewSheetData({
                      ...newSheetData,
                      lastName: e.target.value,
                    })
                  }
                  required
                />
                <FormField
                  label="Prénom"
                  type="text"
                  id="new-sheet-firstname"
                  value={newSheetData.firstName}
                  onChange={(e) =>
                    setNewSheetData({
                      ...newSheetData,
                      firstName: e.target.value,
                    })
                  }
                  required
                />
                <div className="mb-6">
                  <Label
                    htmlFor="new-sheet-type"
                    className="block text-white font-medium mb-2"
                  >
                    Type de fiche
                  </Label>
                  <Select
                    id="new-sheet-type"
                    value={newSheetData.type}
                    onChange={(e) =>
                      setNewSheetData({ ...newSheetData, type: e.target.value })
                    }
                  >
                    <option value="eleve">Élève</option>
                    <option value="professeur">Professeur</option>
                    <option value="admin">Admin</option>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* --- Colonne de droite --- */}
          <div>
            <div className="mb-6">
              <Label
                htmlFor="user-sheet-select"
                className="block text-white font-medium mb-2"
              >
                Associer à une fiche utilisateur
              </Label>
              <Select
                id="user-sheet-select"
                value={selectedSheetId}
                onChange={handleSheetSelection}
              >
                <option value="" disabled>
                  Sélectionner une fiche...
                </option>
                {existingUserSheets.map((sheet) => (
                  <option key={sheet.id} value={sheet.id}>
                    {sheet.name}
                  </option>
                ))}
                <option value="create_new">
                  --- Créer une nouvelle fiche ---
                </option>
              </Select>
            </div>
          </div>
        </div>
      </FormModal>
    </>
  );
};

export default Users;

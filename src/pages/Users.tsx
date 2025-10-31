import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import FormModal from "../components/organisms/FormModal";
import FormField from "../components/molecules/FormField";

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

  // State pour la modale de création
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    status: "Actif",
  });

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
    console.log("Sauvegarde du nouvel utilisateur:", newUser);
    setIsCreateModalOpen(false);
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
        <FormField
          label="Nom complet"
          type="text"
          id="new-user-name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          required
        />
        <FormField
          label="Email"
          type="email"
          id="new-user-email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          required
        />
        {/* Ajoutez d'autres champs ici (rôle, statut, etc.) */}
      </FormModal>
    </>
  );
};

export default Users;

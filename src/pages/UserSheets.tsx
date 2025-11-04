import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import Modal from "../components/organisms/Modal";
import UserSheetCreationForm from "../components/organisms/UserSheetCreationForm";

// Données et colonnes fictives pour les fiches utilisateur
const userSheetColumns = [
  { key: "userName", header: "Utilisateur" },
  { key: "className", header: "Classe" },
  { key: "completion", header: "Complétion" },
  { key: "lastUpdate", header: "Dernière MàJ" },
];

const userSheetData = [
  {
    userName: "Alice Martin",
    className: "Développeur Web - 2024",
    completion: "80%",
    lastUpdate: "10/07/2024",
  },
  {
    userName: "Bob Garcia",
    className: "Développeur Web - 2024",
    completion: "65%",
    lastUpdate: "08/07/2024",
  },
  {
    userName: "Charlie Brown",
    className: "Designer UI/UX - 2024",
    completion: "95%",
    lastUpdate: "11/07/2024",
  },
];

const UserSheets: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // State pour la modale de SUPPRESSION
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Record<string, any> | null>(
    null
  );

  // State pour la modale de CRÉATION
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenDeleteModal = (sheet: Record<string, any>) => {
    setItemToDelete(sheet);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleConfirmDelete = () => {
    console.log("Suppression confirmée pour:", itemToDelete?.userName);
    handleCloseModal();
  };

  // Logique de filtrage pour les fiches
  const filteredUserSheets = userSheetData.filter((sheet) =>
    sheet.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageLayout
        title="Fiches Utilisateur"
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Rechercher une fiche..."
        buttonText="Ajouter une fiche"
        onButtonClick={handleOpenCreateModal}
        columns={userSheetColumns}
        data={filteredUserSheets}
        onDeleteRow={handleOpenDeleteModal}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.userName || ""}
        itemType="la fiche utilisateur"
      />
      {/* Modale de création */}
      <Modal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal}>
        <UserSheetCreationForm
          onClose={handleCloseCreateModal}
          onSubmit={(data) =>
            console.log("Nouvelle fiche utilisateur créée:", data)
          }
        />
      </Modal>
    </>
  );
};

export default UserSheets;

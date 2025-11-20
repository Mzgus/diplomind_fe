import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import UserSheetModal from "../components/organisms/UserSheetModal";

// Données et colonnes fictives pour les fiches utilisateurs
const userSheetColumns = [
  { key: "userName", header: "Nom de l'utilisateur" },
  { key: "className", header: "Classe" },
  { key: "completion", header: "Complétion" },
  { key: "lastUpdate", header: "Dernière mise à jour" },
];

const userSheetData = [
  {
    userName: "Alice Martin",
    className: "Développeur Web - 2024",
    completion: "85%",
    lastUpdate: "20/11/2024",
  },
  {
    userName: "Bob Garcia",
    className: "Designer UI/UX - 2024",
    completion: "60%",
    lastUpdate: "18/11/2024",
  },
  {
    userName: "Charlie Davis",
    className: "Développeur Web - 2024",
    completion: "45%",
    lastUpdate: "15/11/2024",
  },
];

const UserSheets: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Données fictives pour les listes déroulantes
  const existingClasses = [
    { id: "1", name: "Développeur Web - 2024" },
    { id: "2", name: "Designer UI/UX - 2024" },
  ];
  const existingUsers = [
    { id: "1", name: "Alice Martin" },
    { id: "2", name: "Bob Garcia" },
  ];

  // State pour la modale de création
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // State pour la modale de suppression
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Record<string, any> | null>(
    null
  );

  const handleOpenDeleteModal = (sheet: Record<string, any>) => {
    setItemToDelete(sheet);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToDelete(null);
  };
  const handleConfirmDelete = () => {
    console.log("Suppression confirmée pour:", itemToDelete?.userName);
    handleCloseModal();
  };

  const handleSaveNewSheet = (sheetData: any, userData: any | null) => {
    console.log("Sauvegarde de la nouvelle fiche:", {
      sheet: sheetData,
      user: userData,
    });
    setIsCreateModalOpen(false);
  };

  // Logique de filtrage pour les fiches utilisateurs
  const filteredSheets = userSheetData.filter(
    (sheet) =>
      sheet.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sheet.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageLayout
        title="Fiches Utilisateurs"
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Rechercher une fiche..."
        buttonText="Ajouter une fiche"
        onButtonClick={() => setIsCreateModalOpen(true)}
        columns={userSheetColumns}
        data={filteredSheets}
        onDeleteRow={handleOpenDeleteModal}
      />
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.userName || ""}
        itemType="la fiche utilisateur"
      />
      <UserSheetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewSheet}
        existingClasses={existingClasses}
        existingUsers={existingUsers}
      />
    </>
  );
};

export default UserSheets;

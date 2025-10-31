import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";

// Données et colonnes fictives pour les classes
const classColumns = [
  { key: "name", header: "Nom de la Classe" },
  { key: "level", header: "Niveau" },
  { key: "students", header: "Nombre d'élèves" },
  { key: "mainTeacher", header: "Professeur Principal" },
];

const classData = [
  {
    name: "Développeur Web - 2024",
    level: "Bac+2",
    students: 24,
    mainTeacher: "Jean Dupont",
  },
  {
    name: "Designer UI/UX - 2024",
    level: "Bac+3",
    students: 18,
    mainTeacher: "Marie Curie",
  },
  {
    name: "Chef de Projet Digital - 2023",
    level: "Bac+5",
    students: 15,
    mainTeacher: "Sophie Lambert",
  },
];

const Classes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // State pour la modale de suppression
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Record<string, any> | null>(
    null
  );

  const handleOpenDeleteModal = (classe: Record<string, any>) => {
    setItemToDelete(classe);
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

  // Logique de filtrage pour les classes
  const filteredClasses = classData.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageLayout
        title="Classes"
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Rechercher une classe..."
        buttonText="Ajouter une classe"
        onButtonClick={() => console.log("Ajouter une classe cliqué")}
        columns={classColumns}
        data={filteredClasses}
        onDeleteRow={handleOpenDeleteModal}
      />
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ""}
        itemType="la classe"
      />
    </>
  );
};

export default Classes;

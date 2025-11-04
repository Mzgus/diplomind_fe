import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import Modal from "../components/organisms/Modal";
import ClassCreationForm from "../components/organisms/ClassCreationForm";

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

  // State pour la modale de SUPPRESSION
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Record<string, any> | null>(
    null
  );

  // State pour la modale de CRÉATION
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenDeleteModal = (classe: Record<string, any>) => {
    setItemToDelete(classe);
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
        onButtonClick={handleOpenCreateModal}
        columns={classColumns}
        data={filteredClasses}
        onDeleteRow={handleOpenDeleteModal}
      />

      {/* Modale de suppression (existante) */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ""}
        itemType="la classe"
      />
      {/* Modale de création (nouvelle) */}
      <Modal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} >
        <ClassCreationForm onClose={handleCloseCreateModal} onSubmit={(data) => console.log("Nouvelle classe créée:", data)} />
      </Modal>
    </>
  );
};

export default Classes;

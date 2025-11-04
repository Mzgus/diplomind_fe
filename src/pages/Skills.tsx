import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import Modal from "../components/organisms/Modal";
import SkillCreationForm from "../components/organisms/SkillCreationForm";

// Données et colonnes fictives pour les compétences
const skillColumns = [
  { key: "name", header: "Compétence" },
  { key: "category", header: "Catégorie" },
  { key: "level", header: "Niveau Requis" },
];

const skillData = [
  { name: "React", category: "Frontend", level: "Intermédiaire" },
  { name: "Node.js", category: "Backend", level: "Intermédiaire" },
  { name: "Figma", category: "Design", level: "Débutant" },
  { name: "SQL", category: "Base de données", level: "Avancé" },
];

const Skills: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // State pour la modale de suppression
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Record<string, any> | null>(
    null
  );

  // State pour la modale de CRÉATION
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleOpenDeleteModal = (skill: Record<string, any>) => {
    setItemToDelete(skill);
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

  // Logique de filtrage pour les compétences
  const filteredSkills = skillData.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageLayout
        title="Compétences"
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Rechercher une compétence..."
        buttonText="Ajouter une compétence"
        onButtonClick={handleOpenCreateModal}
        columns={skillColumns}
        data={filteredSkills}
        onDeleteRow={handleOpenDeleteModal}
      />
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ""}
        itemType="la compétence"
      />
      {/* Modale de création (nouvelle) */}
      <Modal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal}>
        <SkillCreationForm
          onClose={handleCloseCreateModal}
          onSubmit={(data) => console.log("Nouvelle classe créée:", data)}
        />
      </Modal>
    </>
  );
};

export default Skills;

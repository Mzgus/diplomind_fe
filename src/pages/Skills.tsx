import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import SkillModal from "../components/organisms/SkillModal";

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
  { name: "PostgreSQL", category: "Database", level: "Avancé" },
];

const Skills: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Données fictives pour les listes déroulantes
  const existingCourses = [
    { id: "1", name: "Développement Web" },
    { id: "2", name: "Design UI/UX" },
  ];
  const existingSteps = [
    { id: "1", name: "Maquettage" },
    { id: "2", name: "Intégration" },
  ];

  // State pour la modale de création
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // State pour la modale de suppression
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Record<string, any> | null>(
    null
  );

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

  const handleSaveNewSkill = (skillData: any) => {
    console.log("Sauvegarde de la nouvelle compétence:", skillData);
    setIsCreateModalOpen(false);
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
        onButtonClick={() => setIsCreateModalOpen(true)}
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
      <SkillModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewSkill}
        existingCourses={existingCourses}
        existingSteps={existingSteps}
      />
    </>
  );
};

export default Skills;

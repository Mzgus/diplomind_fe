import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import StepModal from "../components/organisms/StepModal";

// Données et colonnes fictives pour les étapes
const stepColumns = [
  { key: "name", header: "Nom de l'étape" },
  { key: "project", header: "Projet Associé" },
  { key: "order", header: "Ordre" },
  { key: "status", header: "Statut" },
];

const stepData = [
  {
    name: "Maquettage",
    project: "Refonte Site E-commerce",
    order: 1,
    status: "Terminé",
  },
  {
    name: "Développement Front",
    project: "Refonte Site E-commerce",
    order: 2,
    status: "En cours",
  },
  {
    name: "Développement Back",
    project: "Refonte Site E-commerce",
    order: 3,
    status: "À faire",
  },
  {
    name: "Phase de test",
    project: "Application Mobile",
    order: 4,
    status: "À faire",
  },
];

const Steps: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Données fictives pour les listes déroulantes
  const existingProjects = [
    { id: "1", name: "Refonte Site E-commerce" },
    { id: "2", name: "Application Mobile" },
  ];
  const existingSkills = [
    { id: "1", name: "React" },
    { id: "2", name: "Figma" },
  ];

  // State pour la modale de création
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // State pour la modale de suppression
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Record<string, any> | null>(
    null
  );

  const handleOpenDeleteModal = (step: Record<string, any>) => {
    setItemToDelete(step);
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

  const handleSaveNewStep = (stepData: any, skillData: any | null) => {
    console.log("Sauvegarde de la nouvelle étape:", {
      step: stepData,
      skill: skillData,
    });
    setIsCreateModalOpen(false);
  };

  // Logique de filtrage pour les étapes
  const filteredSteps = stepData.filter((step) =>
    step.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageLayout
        title="Étapes"
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Rechercher une étape..."
        buttonText="Ajouter une étape"
        onButtonClick={() => setIsCreateModalOpen(true)}
        columns={stepColumns}
        data={filteredSteps}
        onDeleteRow={handleOpenDeleteModal}
      />
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ""}
        itemType="l'étape"
      />
      <StepModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewStep}
        existingProjects={existingProjects}
        existingSkills={existingSkills}
      />
    </>
  );
};

export default Steps;

import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";

// Données et colonnes fictives pour les cours
const courseColumns = [
  { key: "title", header: "Titre du Cours" },
  { key: "category", header: "Catégorie" },
  { key: "instructor", header: "Instructeur" },
  { key: "status", header: "Statut" },
];

const courseData = [
  {
    title: "Introduction à React",
    category: "Développement Web",
    instructor: "Sophie Lambert",
    status: "Publié",
  },
  {
    title: "TypeScript pour les pros",
    category: "Développement Web",
    instructor: "Jean Dupont",
    status: "Publié",
  },
  {
    title: "Bases de données SQL",
    category: "Backend",
    instructor: "Pierre Martin",
    status: "Brouillon",
  },
  {
    title: "Design UI/UX",
    category: "Design",
    instructor: "Marie Curie",
    status: "Publié",
  },
];

const Courses: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // State pour la modale de suppression
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Record<string, any> | null>(
    null
  );

  const handleOpenDeleteModal = (course: Record<string, any>) => {
    setItemToDelete(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = () => {
    console.log("Suppression confirmée pour:", itemToDelete?.title);
    handleCloseModal();
  };

  // Logique de filtrage pour les cours
  const filteredCourses = courseData.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageLayout
        title="Cours"
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Rechercher un cours..."
        buttonText="Ajouter un cours"
        onButtonClick={() => console.log("Ajouter un cours cliqué")}
        columns={courseColumns}
        data={filteredCourses}
        onDeleteRow={handleOpenDeleteModal}
      />
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.title || ""}
        itemType="le cours"
      />
    </>
  );
};

export default Courses;

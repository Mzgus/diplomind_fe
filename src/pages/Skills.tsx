import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";

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

  // Logique de filtrage pour les compétences
  const filteredSkills = skillData.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout
      title="Compétences"
      searchQuery={searchQuery}
      onSearchChange={(e) => setSearchQuery(e.target.value)}
      searchPlaceholder="Rechercher une compétence..."
      buttonText="Ajouter une compétence"
      onButtonClick={() => console.log("Ajouter une compétence cliqué")}
      columns={skillColumns}
      data={filteredSkills}
    />
  );
};

export default Skills;

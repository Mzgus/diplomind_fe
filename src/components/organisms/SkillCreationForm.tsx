import React, { useState } from "react";
import FormField from "../molecules/FormField";
import Button from "../atoms/Button";
import Dropdown from "../molecules/Dropdown";

interface SkillCreationData {
  name: string;
  description: string;
  courseIds: string[];
  stepIds: string[];
}

interface SkillCreationFormProps {
  onClose: () => void;
  onSubmit: (data: SkillCreationData) => void;
}

// Données fictives pour les cours et les étapes
const courseOptions = [
  { value: "course-1", label: "Introduction à React" },
  { value: "course-2", label: "Node.js pour les pros" },
  { value: "course-3", label: "Design UI/UX avancé" },
];

const stepOptions = [
  { value: "step-1", label: "Maquettage" },
  { value: "step-2", label: "Développement Front" },
  { value: "step-3", label: "Développement Back" },
];

const SkillCreationForm: React.FC<SkillCreationFormProps> = ({
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData: SkillCreationData = {
      name,
      description,
      courseIds: selectedCourses,
      stepIds: selectedSteps,
    };
    onSubmit(formData);
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-xl bg-surface p-8 shadow-lg text-text-main"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">
        Créer une nouvelle compétence
      </h2>
      <div className="grid grid-cols-2 gap-25">
        <div className="flex flex-col space-y-4">
          <FormField
            label="Nom de la compétence :"
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <FormField
            label="Description de la compétence :"
            as="textarea"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
          />
        </div>
        <div className="flex flex-col space-y-4">
          <Dropdown
            label="Associer des cours :"
            options={courseOptions}
            selectedValues={selectedCourses}
            onChange={setSelectedCourses}
            placeholder="Sélectionner des cours"
            itemName="cours"
          />
          <Dropdown
            label="Associer des étapes :"
            options={stepOptions}
            selectedValues={selectedSteps}
            onChange={setSelectedSteps}
            placeholder="Sélectionner des étapes"
            itemName="étape"
          />
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-8">
        <Button
          type="button"
          onClick={onClose}
          className="bg-secondary hover:bg-secondary-hover text-white"
        >
          Annuler
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary-hover text-white">
          Créer la compétence
        </Button>
      </div>
    </form>
  );
};

export default SkillCreationForm;

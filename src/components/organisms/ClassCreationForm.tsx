import React, { useState } from "react";
import FormField from "../molecules/FormField";
import Button from "../atoms/Buttons/Button";
import Dropdown from "../molecules/Dropdown";

// Données fictives pour les élèves
const studentOptions = [
  { value: "student-1", label: "Alice Martin" },
  { value: "student-2", label: "Bob Garcia" },
  { value: "student-3", label: "Charlie Brown" },
  { value: "student-4", label: "Diana Prince" },
  { value: "student-5", label: "Ethan Hunt" },
];

interface ClassCreationData {
  name: string;
  level: string;
  studentIds: string[];
}

interface ClassCreationFormProps {
  onClose: () => void;
  onSubmit: (data: ClassCreationData) => void;
}

const ClassCreationForm: React.FC<ClassCreationFormProps> = ({
  onClose,
  onSubmit,
}) => {
  const [className, setClassName] = useState("");
  const [level] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData: ClassCreationData = {
      name: className,
      level,
      studentIds: selectedStudents,
    };
    onSubmit(formData);
    onClose(); // Ferme la modale après soumission
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-xl bg-surface p-8 shadow-lg text-text-main"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">
        Créer une nouvelle classe
      </h2>
      <div className="space-y-6 flex gap-25">
        <FormField
          label="Nom de la classe :"
          type="text"
          id="className"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Ex: Développeur Web - 2025"
          required
        />
        <Dropdown
          label="Associer des élèves :"
          options={studentOptions}
          selectedValues={selectedStudents}
          onChange={setSelectedStudents}
          placeholder="Sélectionner des élèves"
          itemName="élève"
        />
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
          Créer la classe
        </Button>
      </div>
    </form>
  );
};

export default ClassCreationForm;

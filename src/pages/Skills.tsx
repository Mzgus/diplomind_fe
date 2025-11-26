import React, { useState } from "react";
import SearchBar from "../components/molecules/SearchBar";
import Button from "../components/atoms/Button";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import SkillModal from "../components/organisms/SkillModal";
import StepAssociationModal from "../components/organisms/StepAssociationModal";

// Types
interface Step {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  linkedSteps: Step[];
}

interface Course {
  id: string;
  name: string;
  skills: Skill[];
}

// Mock data with hierarchical structure
const existingProjects = [
  { id: "p1", name: "Site E-commerce" },
  { id: "p2", name: "Application Mobile" },
  { id: "p3", name: "Dashboard Analytics" },
];

const existingSteps = [
  { id: "s1", name: "Maquettage", projectId: "p1" },
  { id: "s2", name: "Intégration Frontend", projectId: "p1" },
  { id: "s3", name: "API Backend", projectId: "p1" },
  { id: "s4", name: "Design UX", projectId: "p2" },
  { id: "s5", name: "Développement React Native", projectId: "p2" },
  { id: "s6", name: "Visualisation de données", projectId: "p3" },
];

const mockCourses: Course[] = [
  {
    id: "c1",
    name: "Développement Web",
    skills: [
      {
        id: "sk1",
        name: "React",
        description: "Bibliothèque frontend moderne",
        linkedSteps: [
          { id: "s2", name: "Intégration Frontend", projectId: "p1", projectName: "Site E-commerce" },
        ],
      },
      {
        id: "sk2",
        name: "Node.js",
        description: "Backend JavaScript",
        linkedSteps: [
          { id: "s3", name: "API Backend", projectId: "p1", projectName: "Site E-commerce" },
        ],
      },
    ],
  },
  {
    id: "c2",
    name: "Design UI/UX",
    skills: [
      {
        id: "sk3",
        name: "Figma",
        description: "Outil de design collaboratif",
        linkedSteps: [
          { id: "s1", name: "Maquettage", projectId: "p1", projectName: "Site E-commerce" },
          { id: "s4", name: "Design UX", projectId: "p2", projectName: "Application Mobile" },
        ],
      },
    ],
  },
  {
    id: "c3",
    name: "Data Science",
    skills: [
      {
        id: "sk4",
        name: "D3.js",
        description: "Visualisation de données",
        linkedSteps: [
          { id: "s6", name: "Visualisation de données", projectId: "p3", projectName: "Dashboard Analytics" },
        ],
      },
    ],
  },
];

const Skills: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set(["c1"]));

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<{ id: string; name: string; description: string; courseId: string } | null>(null);
  const [isStepAssociationModalOpen, setIsStepAssociationModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ skill: Skill; courseId: string } | null>(null);

  const toggleCourse = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const handleSaveNewSkill = (skillData: any) => {
    if (skillData.id) {
      console.log("Mise à jour de la compétence:", skillData);
      // Here you would update the skill in the courses state
      setCourses(courses.map(course => {
        if (course.id === skillData.courseId) {
          return {
            ...course,
            skills: course.skills.map(s =>
              s.id === skillData.id
                ? { ...s, name: skillData.name, description: skillData.description }
                : s
            )
          };
        }
        return course;
      }));
    } else {
      console.log("Nouvelle compétence:", skillData);
      // Here you would add the new skill to the courses state
    }
    setIsCreateModalOpen(false);
    setSkillToEdit(null);
  };

  const handleEditSkill = (skill: Skill, courseId: string) => {
    setSkillToEdit({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      courseId: courseId,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenStepAssociation = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsStepAssociationModalOpen(true);
  };

  const handleSaveStepAssociations = (associations: { projectId: string; stepId: string }[]) => {
    console.log("Nouvelles associations d'étapes:", associations);
    // Here you would update the skill's linkedSteps
    setIsStepAssociationModalOpen(false);
  };

  const handleOpenDeleteModal = (skill: Skill, courseId: string) => {
    setItemToDelete({ skill, courseId });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      console.log("Suppression de:", itemToDelete.skill.name);
      // Update courses state to remove the skill
      setCourses(courses.map(course => {
        if (course.id === itemToDelete.courseId) {
          return {
            ...course,
            skills: course.skills.filter(s => s.id !== itemToDelete.skill.id)
          };
        }
        return course;
      }));
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Filter courses and skills based on search
  const filteredCourses = courses.map(course => ({
    ...course,
    skills: course.skills.filter(skill =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(course => course.skills.length > 0);

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-4 text-text-main">Gestion des Compétences</h1>

      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="w-3/4">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une compétence, un cours..."
          />
        </div>
        <div className="w-1/4 flex gap-2">
          <Button className="flex-1" onClick={() => setIsCreateModalOpen(true)}>
            Ajouter une compétence
          </Button>
          <Button
            className="flex-1"
            onClick={() => (window.location.href = "/project-skills-validation")}
          >
            Valider des compétences
          </Button>
        </div>
      </div>

      {/* Course Accordion */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            Aucune compétence trouvée
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="border border-border rounded-lg overflow-hidden bg-surface">
              {/* Course Header */}
              <button
                onClick={() => toggleCourse(course.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`h-5 w-5 text-text-muted transition-transform ${expandedCourses.has(course.id) ? "rotate-90" : ""
                      }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <h2 className="text-xl font-semibold text-text-main">{course.name}</h2>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {course.skills.length} {course.skills.length === 1 ? "compétence" : "compétences"}
                  </span>
                </div>
              </button>

              {/* Skills List */}
              {expandedCourses.has(course.id) && (
                <div className="border-t border-border">
                  {course.skills.map((skill, index) => (
                    <div
                      key={skill.id}
                      className={`p-4 ${index !== 0 ? "border-t border-border" : ""} hover:bg-background/50 transition-colors`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-text-main">{skill.name}</h3>
                          </div>
                          <p className="text-sm text-text-muted mb-3">{skill.description}</p>

                          {/* Linked Steps */}
                          {skill.linkedSteps.length > 0 ? (
                            <div className="space-y-1">
                              {skill.linkedSteps.map((step) => (
                                <div
                                  key={step.id}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg text-sm mr-2 mb-2 group"
                                >
                                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  <span className="text-text-main font-medium">{step.projectName}</span>
                                  <span className="text-text-muted">-</span>
                                  <span className="text-text-muted">{step.name}</span>
                                  <button
                                    onClick={() => {
                                      console.log(`Suppression de l'association: ${skill.name} - ${step.name}`);
                                      // Here you would update the skill's linkedSteps
                                    }}
                                    className="ml-1 p-0.5 text-text-muted hover:text-danger-text transition-colors opacity-0 group-hover:opacity-100"
                                    title="Retirer cette étape"
                                  >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-text-muted italic">Aucune étape liée</p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenStepAssociation(skill)}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Lier une étape
                          </button>
                          <button
                            onClick={() => handleEditSkill(skill, course.id)}
                            className="p-2 text-text-muted hover:text-text-main hover:bg-background rounded-full transition-colors"
                            title="Éditer cette compétence"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(skill, course.id)}
                            className="p-2 text-danger-text hover:bg-danger-bg rounded-full transition-colors"
                            title="Supprimer cette compétence"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <SkillModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSkillToEdit(null);
        }}
        onSave={handleSaveNewSkill}
        existingCourses={courses.map(c => ({ id: c.id, name: c.name }))}
        existingSteps={existingSteps}
        skillToEdit={skillToEdit}
      />

      <StepAssociationModal
        isOpen={isStepAssociationModalOpen}
        onClose={() => setIsStepAssociationModalOpen(false)}
        onSave={handleSaveStepAssociations}
        skillName={selectedSkill?.name || ""}
        existingProjects={existingProjects}
        existingSteps={existingSteps}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.skill.name || ""}
        itemType="la compétence"
      />
    </div>
  );
};

export default Skills;

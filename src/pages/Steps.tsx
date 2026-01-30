import React, { useState, useEffect } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import StepModal from "../components/organisms/StepModal";
import { StepsService } from "../_services/steps.service";
import { ProjectsService } from "../_services/projects.service";
import { SkillsService } from "../_services/skills.service";
import type { Step, Project, Skill } from "../types";

// Extended Step type for UI
interface StepWithDetails extends Step {
  projectName?: string;
}

const stepColumns = [
  { key: "name", header: "Nom de l'étape" },
  { key: "description", header: "Description" },
  { key: "projectName", header: "Projet Associé" },
  { key: "step_order", header: "Ordre" },
];

const Steps: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [steps, setSteps] = useState<StepWithDetails[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Step | null>(null);
  const [stepToEdit, setStepToEdit] = useState<Step | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stepsRes, projectsRes, skillsRes] = await Promise.all([
        StepsService.getAllSteps(),
        ProjectsService.getAllProjects(),
        SkillsService.getAllSkills(),
      ]);

      const stepsData: Step[] = stepsRes.data;
      const projectsData: Project[] = projectsRes.data;
      const skillsData: Skill[] = skillsRes.data;

      // Map project names to steps
      const enrichedSteps = stepsData.map((s) => {
        const project = projectsData.find((p) => p.id === s.project_id);
        return {
          ...s,
          projectName: project ? project.name : "Non assigné",
        };
      });

      setSteps(enrichedSteps);
      setProjects(projectsData);
      setSkills(skillsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDeleteModal = (step: any) => {
    setItemToDelete(step as Step);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
        try {
            await StepsService.deleteStep(itemToDelete.id);
            fetchData();
        } catch (error) {
            console.error("Failed to delete step", error);
        }
    }
    handleCloseModal();
  };

  const handleSaveNewStep = async (stepData: any, skillData: any | null) => {
    try {
        let stepId = stepData.id;

        // 1. Save/Update Step
        if (stepId) {
            await StepsService.updateStep(stepId, {
                name: stepData.name,
                description: stepData.description,
                project_id: Number(stepData.projectId), // Ensure number
                step_order: Number(stepData.order) || 1
            });
        } else {
             const res = await StepsService.createStep({
                 name: stepData.name,
                 description: stepData.description,
                 project_id: Number(stepData.projectId),
                 step_order: Number(stepData.order) || 1
             });
             stepId = res.data.id;
        }

        // 2. Skill Association
        if (skillData && stepId) {
            if (skillData.name) {
                // Create new skill and link
                const skillRes = await SkillsService.createSkill({
                    name: skillData.name,
                    description: skillData.description
                });
                const newSkillId = skillRes.data.id;
                await StepsService.linkSkillToStep({
                    step_id: stepId,
                    skill_id: newSkillId
                });
            } else if (skillData.id) {
                // Link existing skill (if not already linked?)
                // API just links, assuming idempotency or handling conflict
                await StepsService.linkSkillToStep({
                     step_id: stepId,
                     skill_id: Number(skillData.id)
                });
            }
        }
        
        fetchData();
        setIsCreateModalOpen(false);
    } catch (error) {
        console.error("Failed to save step", error);
    }
  };

  // Logique de filtrage pour les étapes
  const filteredSteps = steps.filter((step) =>
    step.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    step.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    step.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-6">Chargement...</div>;

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
        onEditRow={(row) => {
            setStepToEdit(row as Step);
            setIsCreateModalOpen(true);
        }}
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
        onClose={() => {
            setIsCreateModalOpen(false);
            setStepToEdit(null);
        }}
        onSave={handleSaveNewStep}
        existingProjects={projects.map(p => ({ id: p.id.toString(), name: p.name }))}
        existingSkills={skills.map(s => ({ id: s.id.toString(), name: s.name }))}
        initialData={stepToEdit}
      />
    </>
  );
};

export default Steps;

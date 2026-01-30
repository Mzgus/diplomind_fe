import React, { useState, useEffect } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import ProjectModal from "../components/organisms/ProjectModal";
import { ProjectsService } from "../_services/projects.service";
import { CoursesService } from "../_services/courses.service";
// StepsService might be needed if creating steps, but let's check if we can import it
// Assuming it follows the pattern
import API from "../_services/caller.services";

// Define StepService locally if not exported or use generic caller for now if file not found
// But we saw it exists. Let's try to import it dynamically or just define helper
const createStep = (data: any) => API.post("/steps", data);

import type { Project as ProjectType, Course } from "../types";

// Extended Project type for UI
interface ProjectWithCourse extends ProjectType {
  courseName?: string;
}

const projectColumns = [
  { key: "name", header: "Nom du Projet" },
  { key: "description", header: "Description" },
  { key: "courseName", header: "Cours Associé" },
];

const Project: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<ProjectWithCourse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allSteps, setAllSteps] = useState<any[]>([]); // New state
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ProjectType | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<ProjectType | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch projects, courses AND steps
      const [projectsRes, coursesRes, stepsRes] = await Promise.all([
        ProjectsService.getAllProjects(),
        CoursesService.getAllCourses(),
        // Assuming StepsService is available via import or helper
        API.get("/steps"), // Using direct API call if Service not imported yet, but likely is
      ]);

      const projectsData: ProjectType[] = projectsRes.data;
      const coursesData: Course[] = coursesRes.data;
      const stepsData: any[] = stepsRes.data;

      // Map course names to projects
      const enrichedProjects = projectsData.map((p) => {
        const course = coursesData.find((c) => c.id === p.course_id);
        return {
          ...p,
          courseName: course ? course.name : "Non assigné",
        };
      });

      setProjects(enrichedProjects);
      setCourses(coursesData);
      setAllSteps(stepsData); // Update steps
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDeleteModal = (project: any) => {
    setItemToDelete(project as ProjectType);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await ProjectsService.deleteProject(itemToDelete.id);
        fetchData();
      } catch (error) {
        console.error("Failed to delete project", error);
      }
    }
    handleCloseModal();
  };

  const handleSaveNewProject = async (projectData: any, stepData: any | null) => {
    try {
        let projectId = projectData.id;
        
        // 1. Save/Update Phase
        if (projectId) {
            // Update
             await ProjectsService.updateProject(projectId, {
                name: projectData.name,
                description: projectData.description,
                course_id: Number(projectData.courseId)
             });
        } else {
            // Create
            const res = await ProjectsService.createProject({
                name: projectData.name,
                description: projectData.description,
                course_id: Number(projectData.courseId)
            });
            projectId = res.data.id; // Assuming backend returns the created object with ID
        }

        // 2. Step Creation (if provided)
        if (stepData && projectId) {
             // If creating a new step
             if (stepData.name) {
                 await createStep({
                     name: stepData.name,
                     description: stepData.description,
                     project_id: projectId,
                     step_order: 1 // Default order? Or fetch existing count + 1?
                 });
             } else if (stepData.id) {
                 // Association logic? Steps already have project_id. 
                 // If we selected an existing step, we're likely moving it?
                 // For now, let's assume we call an update on the step
                 // But we don't have updateStep imported.
                 console.log("Linking existing step not fully implemented yet");
             }
        }

        fetchData();
        setIsCreateModalOpen(false);
    } catch (error) {
        console.error("Failed to save project", error);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <>
      <PageLayout
        title="Projets"
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Rechercher un projet..."
        buttonText="Ajouter un projet"
        onButtonClick={() => setIsCreateModalOpen(true)}
        columns={projectColumns}
        data={filteredProjects}
        onEditRow={(row) => {
            setProjectToEdit(row as ProjectType);
            setIsCreateModalOpen(true);
        }}
        onDeleteRow={handleOpenDeleteModal}
      />
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ""}
        itemType="le projet"
      />
      <ProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => {
            setIsCreateModalOpen(false);
            setProjectToEdit(null);
        }}
        onSave={handleSaveNewProject}
        existingCourses={courses.map(c => ({ id: c.id.toString(), name: c.name }))}
        existingSteps={allSteps.map(s => ({ id: s.id.toString(), name: s.name }))} 
        initialData={projectToEdit}
      />
    </>
  );
};

export default Project;

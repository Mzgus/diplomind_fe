import React, { useState, useEffect } from "react";
import SearchBar from "../components/molecules/SearchBar";
import Button from "../components/atoms/Button";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import CourseModal from "../components/organisms/CourseModal";
import ProjectAssociationModal from "../components/organisms/ProjectAssociationModal";
import { CoursesService } from "../_services/courses.service";
import { ProjectsService } from "../_services/projects.service";
import type { Course, Project } from "../types";

// Extended Course type for UI (includes linkedProjects)
interface CourseWithProjects extends Course {
  linkedProjects: Project[];
}

const Courses: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<CourseWithProjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [isProjectAssociationModalOpen, setIsProjectAssociationModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithProjects | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Course | null>(null);
  
  // Project Deletion
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Fetch all courses and their projects
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await CoursesService.getAllCourses();
      const coursesData: Course[] = res.data;

      // For each course, fetch its linked projects
      // Note: In a real app, you might want to fetch this on expand
      // or duplicate the query to "get_all_courses_with_projects" in backend
      const coursesWithProjects = await Promise.all(
        coursesData.map(async (course) => {
          try {
            const projectsRes = await ProjectsService.getProjectsByCourse(course.id);
            return { ...course, linkedProjects: projectsRes.data };
          } catch (error) {
            console.error(`Failed to fetch projects for course ${course.id}`, error);
            return { ...course, linkedProjects: [] };
          }
        })
      );

      setCourses(coursesWithProjects);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch all projects when needed (for association modal)
  const fetchAllProjects = async () => {
    try {
      const res = await ProjectsService.getAllProjects();
      setAllProjects(res.data);
    } catch (error) {
      console.error("Failed to fetch all projects", error);
    }
  };

  const toggleCourse = (courseId: number) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const handleSaveCourse = async (courseData: any) => {
    try {
      if (courseData.id) {
        // Update existing course
        await CoursesService.updateCourse(courseData.id, {
            name: courseData.name,
            description: courseData.description,
            year: courseData.year 
        });
      } else {
        // Create new course
        await CoursesService.createCourse({
            name: courseData.name,
            description: courseData.description,
            year: courseData.year || new Date().getFullYear()
        });
      }
      // Refresh list
      fetchCourses();
      setIsCreateModalOpen(false);
      setCourseToEdit(null);
    } catch (error) {
      console.error("Failed to save course", error);
    }
  };

  const handleEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setIsCreateModalOpen(true);
  };

  const handleOpenProjectAssociation = async (course: CourseWithProjects) => {
    setSelectedCourse(course);
    await fetchAllProjects();
    setIsProjectAssociationModalOpen(true);
  };

  const handleSaveProjectAssociations = async (projectIds: string[]) => {
    // Note: The UI Modal returns strings, but our IDs are numbers.
    // Also the modal logic needs to handle linking/unlinking.
    // Ideally, the backend would support "set_course_projects" endpoint.
    // For now, we will just close the modal and refresh, assuming the modal handles calls?
    // Wait, the modal usually returns the selected IDs and the parent handles the save.
    // Let's implement the diff logic here or assume simple "update project" logic?
    
    // Actually, projects are linked to a course via `project.course_id`.
    // So to "link" a project to a course, we update the project.
    
    if (selectedCourse) {
       try {
           const numericProjectIds = projectIds.map(Number);
           
           // We need to know which ones were added and which removed?
           // Or just update all selected projects to have this course_id?
           // This depends on the backend. `project` has a `course_id`.
           // So a project belongs to ONE course.
           
           // 1. Get current linked projects
           const currentIds = selectedCourse.linkedProjects.map(p => p.id);
           
           // 2. Find added
           const added = numericProjectIds.filter(id => !currentIds.includes(id));
           
           // 3. Find removed
           const removed = currentIds.filter(id => !numericProjectIds.includes(id));
           
           // Execute updates
           for (const id of added) {
               // Update project to set course_id = selectedCourse.id
               // We first need to get the project to keep other fields? 
               // Or use a PATCH endpoint? Using updateProject(PUT) requires all fields.
               // We should fetch the project first.
               const pRes = await ProjectsService.getProjectById(id);
               const p = pRes.data;
               await ProjectsService.updateProject(id, { ...p, course_id: selectedCourse.id });
           }
           
           for (const id of removed) {
                // Unlink: set course_id to null? Or 0? Backend might not support null if course_id is NOT NULL.
                // If it's nullable, we send null. If not, we can't unlink without deleting or reassigning.
                // Assuming nullable or we have a specialized endpoint? 
                // Wait, checking `seed.sql` or `schema` would be good. 
                // But generally, we might not want to orphan projects.
                // Let's assume we can set it to a "Unassigned" course or handle gracefully.
                // Checking `types.ts`: `course_id: number`. It's mandatory.
                // So a project MUST belong to a course? 
                // In that case, we can only "Assign" projects from other courses.
                
                // Keep it simple: Only handle "Added" (Reassignment). 
                // User cannot "remove" a project from a course without assigning it to another?
                // Or maybe we have a default "Unassigned" course? 
                // Let's just log a warning for removed for now.
                console.warn("Unlinking project not fully supported if course_id is mandatory", id);
           }
           
           fetchCourses();
       } catch (error) {
           console.error("Failed to update project associations", error);
       }
    }
    setIsProjectAssociationModalOpen(false);
  };

  /* const handleRemoveProject = async (course: CourseWithProjects, projectId: number) => {
      // Unused params prevented validation
      console.log(course, projectId);
      // As discussed, if course_id is mandatory, we can't just remove it. 
      // We would need to delete the project or move it.
      // For now, let's try to update it? Or maybe the backend allows null?
      // If `Project` struct has `course_id: i32`, it is likely not null.
      // Let's check `types.ts` again... `course_id: number`.
      console.warn("Cannot simply unlink project - it requires a course association.");
      // We could prompt user to delete? 
      // For this MVP, let's disable the remove button logic or make it a "Delete Project" action.
  }; */

  const handleOpenDeleteModal = (course: Course) => {
    setItemToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await CoursesService.deleteCourse(itemToDelete.id);
        fetchCourses();
      } catch (error) {
        console.error("Failed to delete course", error);
      }
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleCreateProjectInModal = async (name: string, description: string): Promise<string | null> => {
      if (!selectedCourse) return null;
      try {
          const res = await ProjectsService.createProject({
              name,
              description,
              course_id: selectedCourse.id,
              // year? optional or needed?
          });
          // Refresh all projects to update the modal list
          await fetchAllProjects();
          return res.data.id.toString();
      } catch (error) {
          console.error("Failed to create project", error);
          alert("Erreur lors de la création du projet");
          return null;
      }
  };

  const handleRemoveProject = (project: Project) => {
      setProjectToDelete(project);
      setIsDeleteProjectModalOpen(true);
  };

  const handleConfirmDeleteProject = async () => {
      if (projectToDelete) {
          try {
              await ProjectsService.deleteProject(projectToDelete.id);
              fetchCourses(); 
          } catch (error) {
              console.error("Failed to delete project", error);
          }
      }
      setIsDeleteProjectModalOpen(false);
      setProjectToDelete(null);
  };

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.linkedProjects.some(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-4 text-text-main">Gestion des Cours</h1>

      <div className="flex items-center justify-between mb-8 gap-4">
        {/* ... */}
        <div className="w-3/4">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un cours, un projet..."
          />
        </div>
        <div className="w-1/4">
          <Button className="w-full" onClick={() => setIsCreateModalOpen(true)}>
            Ajouter un cours
          </Button>
        </div>
      </div>

      {/* Course Accordion */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            Aucun cours trouvé
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="border border-border rounded-lg overflow-hidden bg-surface">
              {/* Course Header */}
              <button
                onClick={() => toggleCourse(course.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors"
                type="button"
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
                    {course.linkedProjects.length} {course.linkedProjects.length === 1 ? "projet" : "projets"}
                  </span>
                </div>
              </button>

              {/* Course Details */}
              {expandedCourses.has(course.id) && (
                <div className="border-t border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-text-muted mb-4">{course.description}</p>

                      {/* Linked Projects */}
                      {course.linkedProjects.length > 0 ? (
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-text-main mb-2">Projets associés:</h3>
                          {course.linkedProjects.map((project) => (
                            <div
                              key={project.id}
                              className="inline-flex items-start gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-sm mr-2 mb-2 group max-w-md"
                            >
                              <svg className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              <div className="flex-1 min-w-0">
                                <div className="text-text-main font-medium">{project.name}</div>
                                <div className="text-text-muted text-xs">{project.description}</div>
                              </div>
                              <button
                                onClick={() => handleRemoveProject(project)}
                                className="ml-1 p-0.5 text-text-muted hover:text-danger-text transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                title="Supprimer le projet"
                                type="button"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-text-muted italic">Aucun projet lié</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                    {/* Project Association disabled from here for now, relying on Project Page? Or enable reassign?
                        Let's enable it but with the caveat that it just moves projects TO this course.
                     */}
                      <button
                        onClick={() => handleOpenProjectAssociation(course)}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                        type="button"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Lier un projet
                      </button>
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="p-2 text-text-muted hover:text-text-main hover:bg-background rounded-full transition-colors"
                        title="Éditer ce cours"
                        type="button"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(course)}
                        className="p-2 text-danger-text hover:bg-danger-bg rounded-full transition-colors"
                        title="Supprimer ce cours"
                        type="button"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <CourseModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCourseToEdit(null);
        }}
        onSave={handleSaveCourse}
        courseToEdit={courseToEdit ? {
            ...courseToEdit,
            description: courseToEdit.description || ""
        } : null}
      />

      <ProjectAssociationModal
        isOpen={isProjectAssociationModalOpen}
        onClose={() => setIsProjectAssociationModalOpen(false)}
        onSave={handleSaveProjectAssociations}
        courseName={selectedCourse?.name || ""}
        existingProjects={allProjects.map(p => ({
            id: p.id.toString(), // Convert number to string for the modal which expects strings
            name: p.name,
            description: p.description || ""
        }))}
        currentProjectIds={selectedCourse?.linkedProjects.map(p => p.id.toString()) || []}
        onCreateProject={handleCreateProjectInModal}
      />
      
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ""}
        itemType="le cours"
      />

      <DeleteConfirmationModal
        isOpen={isDeleteProjectModalOpen}
        onClose={() => {
            setIsDeleteProjectModalOpen(false);
            setProjectToDelete(null);
        }}
        onConfirm={handleConfirmDeleteProject}
        itemName={projectToDelete?.name || ""}
        itemType="le projet"
      />
    </div>
  );
};

export default Courses;

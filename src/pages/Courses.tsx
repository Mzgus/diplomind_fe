import React, { useState } from "react";
import SearchBar from "../components/molecules/SearchBar";
import Button from "../components/atoms/Button";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import CourseModal from "../components/organisms/CourseModal";
import ProjectAssociationModal from "../components/organisms/ProjectAssociationModal";

// Types
interface Project {
  id: string;
  name: string;
  description: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  linkedProjects: Project[];
}

// Mock data with hierarchical structure
const existingProjects: Project[] = [
  { id: "p1", name: "Site E-commerce", description: "Plateforme de vente en ligne moderne" },
  { id: "p2", name: "Application Mobile", description: "Application de gestion de tâches" },
  { id: "p3", name: "Dashboard Analytics", description: "Tableau de bord de visualisation de données" },
  { id: "p4", name: "API REST", description: "API backend pour applications client" },
  { id: "p5", name: "Blog Personnel", description: "Site web de blog avec CMS" },
];

const mockCourses: Course[] = [
  {
    id: "c1",
    name: "Développement Web Frontend",
    description: "Apprentissage des technologies web modernes comme React, TypeScript et design patterns",
    linkedProjects: [
      { id: "p1", name: "Site E-commerce", description: "Plateforme de vente en ligne moderne" },
      { id: "p2", name: "Application Mobile", description: "Application de gestion de tâches" },
    ],
  },
  {
    id: "c2",
    name: "Backend et API",
    description: "Création d'APIs robustes et scalables avec Node.js et bases de données",
    linkedProjects: [
      { id: "p4", name: "API REST", description: "API backend pour applications client" },
    ],
  },
  {
    id: "c3",
    name: "Data Science et Visualisation",
    description: "Analyse de données et création de tableaux de bord interactifs",
    linkedProjects: [
      { id: "p3", name: "Dashboard Analytics", description: "Tableau de bord de visualisation de données" },
    ],
  },
  {
    id: "c4",
    name: "Design UI/UX",
    description: "Principes de design d'interfaces utilisateur et expérience utilisateur",
    linkedProjects: [],
  },
];

const Courses: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set(["c1"]));

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<{ id: string; name: string; description: string } | null>(null);
  const [isProjectAssociationModalOpen, setIsProjectAssociationModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Course | null>(null);

  const toggleCourse = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const handleSaveCourse = (courseData: any) => {
    if (courseData.id) {
      console.log("Mise à jour du cours:", courseData);
      // Update existing course
      setCourses(courses.map(course =>
        course.id === courseData.id
          ? { ...course, name: courseData.name, description: courseData.description }
          : course
      ));
    } else {
      console.log("Nouveau cours:", courseData);
      // Add new course
      const newCourse: Course = {
        id: `c${Date.now()}`,
        name: courseData.name,
        description: courseData.description,
        linkedProjects: [],
      };
      setCourses([...courses, newCourse]);
    }
    setIsCreateModalOpen(false);
    setCourseToEdit(null);
  };

  const handleEditCourse = (course: Course) => {
    setCourseToEdit({
      id: course.id,
      name: course.name,
      description: course.description,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenProjectAssociation = (course: Course) => {
    setSelectedCourse(course);
    setIsProjectAssociationModalOpen(true);
  };

  const handleSaveProjectAssociations = (projectIds: string[]) => {
    if (selectedCourse) {
      console.log("Nouvelles associations de projets:", projectIds);
      // Update course's linkedProjects
      const updatedProjects = projectIds
        .map(id => existingProjects.find(p => p.id === id))
        .filter((p): p is Project => p !== undefined);

      setCourses(courses.map(course =>
        course.id === selectedCourse.id
          ? { ...course, linkedProjects: updatedProjects }
          : course
      ));
    }
    setIsProjectAssociationModalOpen(false);
  };

  const handleRemoveProject = (course: Course, projectId: string) => {
    console.log(`Suppression du projet ${projectId} du cours ${course.id}`);
    setCourses(courses.map(c =>
      c.id === course.id
        ? { ...c, linkedProjects: c.linkedProjects.filter(p => p.id !== projectId) }
        : c
    ));
  };

  const handleOpenDeleteModal = (course: Course) => {
    setItemToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      console.log("Suppression de:", itemToDelete.name);
      setCourses(courses.filter(c => c.id !== itemToDelete.id));
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.linkedProjects.some(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-4 text-text-main">Gestion des Cours</h1>

      <div className="flex items-center justify-between mb-8 gap-4">
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
                                onClick={() => handleRemoveProject(course, project.id)}
                                className="ml-1 p-0.5 text-text-muted hover:text-danger-text transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                title="Retirer ce projet"
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
                      <button
                        onClick={() => handleOpenProjectAssociation(course)}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2"
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
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(course)}
                        className="p-2 text-danger-text hover:bg-danger-bg rounded-full transition-colors"
                        title="Supprimer ce cours"
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
        courseToEdit={courseToEdit}
      />

      <ProjectAssociationModal
        isOpen={isProjectAssociationModalOpen}
        onClose={() => setIsProjectAssociationModalOpen(false)}
        onSave={handleSaveProjectAssociations}
        courseName={selectedCourse?.name || ""}
        existingProjects={existingProjects}
        currentProjectIds={selectedCourse?.linkedProjects.map(p => p.id) || []}
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
    </div>
  );
};

export default Courses;

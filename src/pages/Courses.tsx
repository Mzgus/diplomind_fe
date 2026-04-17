import React, { useState, useEffect, useContext } from "react";
import CoursePageHeader from "../components/molecules/CoursePageHeader";
import CourseAccordionItem from "../components/organisms/CourseAccordionItem";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import CourseModal from "../components/organisms/CourseModal";
import ProjectAssociationModal from "../components/organisms/ProjectAssociationModal";
import { CoursesService } from "../_services/courses.service";
import { ProjectsService } from "../_services/projects.service";
import type { Course, Project } from "../types";
import { AuthContext } from "../context/AuthContext";

interface CourseWithProjects extends Course {
    linkedProjects: Project[];
}

const Courses: React.FC = () => {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.user_role === "admin";
    const isStudent = user?.user_role === "student";

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

    // Project deletion
    const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    // --- Fetch ---
    const fetchCourses = async () => {
        try {
            setLoading(true);
            let coursesData: Course[];

            if (isStudent && user?.user_id && user.user_id > 0) {
                const res = await CoursesService.getUserCourses(user.user_id);
                coursesData = res.data;
            } else {
                const res = await CoursesService.getAllCourses();
                coursesData = res.data;
            }

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

    const fetchAllProjects = async () => {
        try {
            const res = await ProjectsService.getAllProjects();
            setAllProjects(res.data);
        } catch (error) {
            console.error("Failed to fetch all projects", error);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchCourses();
    }, [user]);

    // --- Handlers ---
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
                await CoursesService.updateCourse(courseData.id, {
                    name: courseData.name,
                    description: courseData.description,
                    year: courseData.year,
                });
            } else {
                await CoursesService.createCourse({
                    name: courseData.name,
                    description: courseData.description,
                    year: courseData.year || new Date().getFullYear(),
                });
            }
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
        if (selectedCourse) {
            try {
                const numericProjectIds = projectIds.map(Number);
                const currentIds = selectedCourse.linkedProjects.map((p) => p.id);
                const added = numericProjectIds.filter((id) => !currentIds.includes(id));
                const removed = currentIds.filter((id) => !numericProjectIds.includes(id));

                for (const id of added) {
                    const pRes = await ProjectsService.getProjectById(id);
                    const p = pRes.data;
                    await ProjectsService.updateProject(id, { ...p, course_id: selectedCourse.id });
                }

                for (const id of removed) {
                    console.warn("Unlinking project not fully supported if course_id is mandatory", id);
                }

                fetchCourses();
            } catch (error) {
                console.error("Failed to update project associations", error);
            }
        }
        setIsProjectAssociationModalOpen(false);
    };

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
            });
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

    // --- Derived ---
    const filteredCourses = courses.filter(
        (course) =>
            course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.linkedProjects.some((project) =>
                project.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    if (loading) return <div className="p-6">Chargement...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 text-text-main">Gestion des Cours</h1>

            <CoursePageHeader
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                isAdmin={isAdmin}
                onAdd={() => setIsCreateModalOpen(true)}
            />

            {/* Liste accordéon */}
            <div className="space-y-4">
                {filteredCourses.length === 0 ? (
                    <div className="text-center py-12 text-text-muted">Aucun cours trouvé</div>
                ) : (
                    filteredCourses.map((course) => (
                        <CourseAccordionItem
                            key={course.id}
                            course={course}
                            isExpanded={expandedCourses.has(course.id)}
                            isAdmin={isAdmin}
                            onToggle={() => toggleCourse(course.id)}
                            onEdit={handleEditCourse}
                            onDelete={handleOpenDeleteModal}
                            onLinkProject={handleOpenProjectAssociation}
                            onDeleteProject={handleRemoveProject}
                        />
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
                courseToEdit={courseToEdit ? { ...courseToEdit, description: courseToEdit.description || "" } : null}
            />

            <ProjectAssociationModal
                isOpen={isProjectAssociationModalOpen}
                onClose={() => setIsProjectAssociationModalOpen(false)}
                onSave={handleSaveProjectAssociations}
                courseName={selectedCourse?.name || ""}
                existingProjects={allProjects.map((p) => ({
                    id: p.id.toString(),
                    name: p.name,
                    description: p.description || "",
                }))}
                currentProjectIds={selectedCourse?.linkedProjects.map((p) => p.id.toString()) || []}
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

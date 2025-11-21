import React, { useState } from "react";
import SkillValidationModal from "../components/organisms/SkillValidationModal";

// Mock Data
const students = [
    { id: "1", name: "Franchomme Maxime", avatar: "https://i.pravatar.cc/150?u=1" },
    { id: "2", name: "Ilan Trigueiro Legrand", avatar: "https://i.pravatar.cc/150?u=2" },
    { id: "3", name: "Alice Martin", avatar: "https://i.pravatar.cc/150?u=3" },
    { id: "4", name: "Bob Garcia", avatar: "https://i.pravatar.cc/150?u=4" },
    { id: "5", name: "Charlie Davis", avatar: "https://i.pravatar.cc/150?u=5" },
    { id: "6", name: "Diana Evans", avatar: "https://i.pravatar.cc/150?u=6" },
];

const steps = [
    {
        id: "step1",
        name: "Maquettage & Prototypage",
        skills: [
            { id: "s1", name: "Créer des wireframes et pleins d'autres", description: "Capacité à créer des maquettes basse fidélité." },
            { id: "s2", name: "Prototypage interactif", description: "Créer des prototypes navigables sur Figma." },
            { id: "s3", name: "Design System", description: "Mettre en place un système de design cohérent." },
        ],
    },
    {
        id: "step2",
        name: "Développement Front-end",
        skills: [
            { id: "s4", name: "Intégration HTML/CSS", description: "Respecter la maquette au pixel près." },
            { id: "s5", name: "Logique React", description: "Utilisation des hooks et gestion d'état." },
            { id: "s6", name: "Responsive Design", description: "Adaptation mobile et tablette." },
        ],
    },
];

const projects = [
    "Refonte Site E-commerce",
    "Application Mobile",
    "Outil de gestion interne",
    "Campagne Marketing",
];

// Flatten skills for easier indexing
const allSkills = steps.flatMap((step) => step.skills);

// Mock Validation Data
const initialValidations: Record<string, { status: string; comment: string }> = {
    "1_s1": { status: "Validé", comment: "Excellent travail" },
    "1_s2": { status: "Non validé", comment: "Manque de précision" },
    "2_s1": { status: "Partiellement validé", comment: "Bon début mais incomplet" },
    "3_s4": { status: "Validé", comment: "" },
    "4_s5": { status: "Non évalué", comment: "" },
};

const ProjectSkillsValidation: React.FC = () => {
    const [validations, setValidations] = useState(initialValidations);
    const [selectedProject, setSelectedProject] = useState(projects[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCell, setSelectedCell] = useState<{
        studentId: string;
        skillId: string;
    } | null>(null);

    const handleCellClick = (studentId: string, skillId: string) => {
        setSelectedCell({ studentId, skillId });
    };

    const handleModalClose = () => {
        setSelectedCell(null);
    };

    const handleModalConfirm = (status: string, comment: string) => {
        if (selectedCell) {
            const key = `${selectedCell.studentId}_${selectedCell.skillId}`;
            setValidations((prev) => ({
                ...prev,
                [key]: { status, comment },
            }));
        }
    };

    const getStatusStyle = (status?: string) => {
        switch (status) {
            case "Validé":
                return "bg-success-bg text-success-text border-success-border hover:bg-success-border";
            case "Non validé":
                return "bg-danger-bg text-danger-text border-danger-border hover:bg-danger-border";
            case "Partiellement validé":
                return "bg-warning-bg text-warning-text border-warning-border hover:bg-warning-border";
            default:
                return "bg-background text-text-muted border-border hover:bg-border";
        }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case "Validé":
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case "Non validé":
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case "Partiellement validé":
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return <div className="w-2 h-2 rounded-full bg-text-muted/30" />;
        }
    };

    const selectedSkill = selectedCell
        ? allSkills.find((s) => s.id === selectedCell.skillId)
        : null;
    const selectedStudent = selectedCell
        ? students.find((s) => s.id === selectedCell.studentId)
        : null;
    const currentValidation = selectedCell
        ? validations[`${selectedCell.studentId}_${selectedCell.skillId}`]
        : null;

    const filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background p-8 font-sans text-text-main">
            {/* Header Section */}
            <div className="max-w-full mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-text-main tracking-tight">
                            Validation des Compétences
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-text-muted">Projet :</span>
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="bg-transparent font-medium text-text-main border-b border-border focus:border-primary focus:outline-none py-1 pr-8 cursor-pointer hover:border-text-muted transition-colors"
                            >
                                {projects.map((project) => (
                                    <option key={project} value={project}>
                                        {project}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher un étudiant..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-surface border border-border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64 text-text-main"
                            />
                            <svg
                                className="w-5 h-5 text-text-muted absolute left-3 top-1/2 transform -translate-y-1/2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>

                        <select className="px-4 py-2 bg-surface border border-border rounded-lg shadow-sm text-sm font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer hover:bg-background transition-colors">
                            <option>Classe: B3 Dev Web</option>
                            <option>Classe: B3 Design</option>
                        </select>
                        <select className="px-4 py-2 bg-surface border border-border rounded-lg shadow-sm text-sm font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer hover:bg-background transition-colors">
                            <option>Cours: Développement Front</option>
                            <option>Cours: UX Design</option>
                        </select>
                    </div>
                </div>

                {/* Matrix Container */}
                <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden flex flex-col h-[calc(100vh-200px)]">
                    <div className="overflow-auto flex-1 relative custom-scrollbar">
                        <table className="border-separate border-spacing-0">
                            <thead>
                                {/* Steps Header */}
                                <tr>
                                    <th className="sticky top-0 left-0 z-30 bg-surface p-4 border-b border-r border-border whitespace-nowrap h-16 min-w-[250px]">
                                        <div className="flex items-center justify-end h-full text-text-muted font-bold text-sm uppercase tracking-wider">
                                            Étapes &rarr;
                                        </div>
                                    </th>
                                    {steps.map((step) => (
                                        <th
                                            key={step.id}
                                            colSpan={step.skills.length}
                                            className="sticky top-0 z-20 bg-background p-3 border-b border-r border-border text-center text-xs font-bold text-text-muted uppercase tracking-wider"
                                        >
                                            {step.name}
                                        </th>
                                    ))}
                                </tr>
                                {/* Skills Header */}
                                <tr>
                                    <th className="sticky top-16 left-0 z-30 bg-surface p-4 border-b border-r border-border shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                        <div className="flex flex-col justify-between h-full">
                                            <div className="flex items-center justify-end h-full text-text-muted font-bold text-sm uppercase tracking-wider">
                                                Compétences &rarr;
                                            </div>
                                        </div>
                                    </th>
                                    {allSkills.map((skill) => (
                                        <th
                                            key={skill.id}
                                            className="sticky top-16 z-20 bg-surface border-b border-r border-border min-w-[60px] w-[60px] h-[180px] align-bottom hover:bg-background transition-colors group cursor-help pb-2"
                                            title={skill.description}
                                        >
                                            <div className="flex items-center justify-center h-full">
                                                <div className="transform -rotate-45 w-[160px]  mb-2 text-left">
                                                    <span className="text-sm font-medium text-text-main group-hover:text-primary transition-colors block">
                                                        {skill.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="group">
                                        {/* Student Row Header */}
                                        <td className="sticky left-0 z-10 bg-surface p-4 border-b border-r border-border group-hover:bg-primary/10 transition-colors shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={student.avatar}
                                                    alt={student.name}
                                                    className="w-8 h-8 rounded-full bg-background object-cover border border-border"
                                                />
                                                <span className="font-medium text-text-main text-sm group-hover:text-primary-hover transition-colors">
                                                    {student.name}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Validation Cells */}
                                        {allSkills.map((skill) => {
                                            const key = `${student.id}_${skill.id}`;
                                            const validation = validations[key];
                                            return (
                                                <td
                                                    key={skill.id}
                                                    onClick={() => handleCellClick(student.id, skill.id)}
                                                    className="p-2 border-b border-r border-border bg-surface hover:bg-background transition-all cursor-pointer text-center relative min-w-[60px]"
                                                >
                                                    <div
                                                        className={`w-full h-full min-h-[50px] rounded-md flex items-center justify-center border transition-all duration-200 ${getStatusStyle(
                                                            validation?.status
                                                        )}`}
                                                    >
                                                        {getStatusIcon(validation?.status)}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Validation Modal */}
            <SkillValidationModal
                isOpen={!!selectedCell}
                onClose={handleModalClose}
                onConfirm={handleModalConfirm}
                studentName={selectedStudent?.name || ""}
                skillName={selectedSkill?.name || ""}
                skillDescription={selectedSkill?.description || ""}
                initialStatus={currentValidation?.status}
                initialComment={currentValidation?.comment}
            />

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
        </div>
    );
};

export default ProjectSkillsValidation;

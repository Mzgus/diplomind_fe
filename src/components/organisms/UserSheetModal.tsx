import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Buttons/Button";
import InputGroup from "../molecules/InputGroup";
import SelectGroup from "../molecules/SelectGroup";

interface UserSheetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sheetData: any, userData: any | null) => void;
    existingClasses: { id: number; name: string }[];
    existingCourses: { id: number; name: string }[];
    existingUsers: { id: number; name: string }[];
    initialData?: any; // For editing if needed
    preselectedAccountId?: number;
}

const UserSheetModal: React.FC<UserSheetModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingClasses,
    existingCourses,
    existingUsers,
    initialData,
    preselectedAccountId
}) => {
    // Basic fields
    const [sheetType, setSheetType] = useState("student");
    const [sheetFirstName, setSheetFirstName] = useState("");
    const [sheetLastName, setSheetLastName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState("");

    // Dynamic selectors
    const [selectedClassId, setSelectedClassId] = useState(""); // For Student
    const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]); // For Teacher
    const [courseSearchQuery, setCourseSearchQuery] = useState(""); // Course search filter

    useEffect(() => {
        if (isOpen) {
            setCourseSearchQuery("");
            if (initialData) {
                setSheetLastName(initialData.last_name || "");
                setSheetFirstName(initialData.first_name || "");
                setSheetType(initialData.type_user || "student");
                setSelectedUserId(
                    initialData.account_id 
                        ? String(initialData.account_id) 
                        : (preselectedAccountId ? String(preselectedAccountId) : "")
                );
                setSelectedClassId(initialData.class_id ? String(initialData.class_id) : "");
                setSelectedCourseIds(initialData.course_ids || []);
                setIsActive(initialData.active !== false);
            } else {
                setSheetType("student");
                setSheetFirstName("");
                setSheetLastName("");
                setSelectedClassId("");
                setSelectedCourseIds([]);
                setSelectedUserId(preselectedAccountId ? String(preselectedAccountId) : "");
                setIsActive(true);
            }
        }
    }, [isOpen, initialData, preselectedAccountId]);

    const handleToggleCourse = (courseId: number) => {
        if (selectedCourseIds.includes(courseId)) {
            setSelectedCourseIds(selectedCourseIds.filter(id => id !== courseId));
        } else {
            setSelectedCourseIds([...selectedCourseIds, courseId]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (sheetType === "student" && !selectedClassId) {
            alert("Veuillez sélectionner une classe.");
            return;
        }

        const sheetData = {
            nom: sheetLastName,
            prenom: sheetFirstName,
            type_user: sheetType,
            classId: sheetType === "student" && selectedClassId ? Number(selectedClassId) : null,
            courseIds: sheetType === "teacher" ? selectedCourseIds : [],
            active: isActive,
        };

        const userData = selectedUserId ? { id: Number(selectedUserId) } : null;
        onSave(sheetData, userData);
    };

    const filteredCourses = existingCourses.filter(course =>
        course.name.toLowerCase().includes(courseSearchQuery.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-2xl rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold">
                        {initialData ? "Modifier le profil" : "Créer un profil"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-main focus:outline-none"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    {/* Identity */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <InputGroup
                                id="sheet-firstname"
                                label="Prénom"
                                placeholder="Prénom..."
                                value={sheetFirstName}
                                onChange={(e) => setSheetFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <InputGroup
                                id="sheet-lastname"
                                label="Nom"
                                placeholder="Nom..."
                                value={sheetLastName}
                                onChange={(e) => setSheetLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Role & Status */}
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <SelectGroup
                                id="sheet-type"
                                label="Rôle / Type de profil"
                                value={sheetType}
                                onChange={(e) => setSheetType(e.target.value)}
                            >
                                <option value="student">Élève</option>
                                <option value="teacher">Professeur</option>
                                <option value="admin">Admin</option>
                            </SelectGroup>
                        </div>
                        <div className="flex flex-col gap-2 justify-center pt-5">
                            <span className="text-xs font-semibold text-text-muted uppercase">Statut Actif</span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={isActive}
                                onClick={() => setIsActive(!isActive)}
                                className={`${
                                    isActive ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}
                            >
                                <span
                                    className={`${
                                        isActive ? "translate-x-6" : "translate-x-1"
                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Account association dropdown (shown only if not preselected) */}
                    {!preselectedAccountId && (
                        <SelectGroup
                            id="associate-user"
                            label="Associer à un compte (Email)"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="">-- Sans compte (Fiche Orpheline) --</option>
                            {existingUsers.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </SelectGroup>
                    )}

                    {/* Dynamic Sections Based on Role */}
                    <div className="border-t border-border pt-4 mt-2">
                        {sheetType === "student" && (
                            <SelectGroup
                                id="student-class"
                                label="Associer une classe"
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                            >
                                <option value="" disabled>Choisir une classe...</option>
                                {existingClasses.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </SelectGroup>
                        )}

                        {sheetType === "teacher" && (
                            <div className="flex flex-col gap-2">
                                <label className="block text-sm font-medium text-text-main">
                                    Associer à des cours / matières
                                </label>
                                <div className="border border-border rounded-lg bg-background overflow-hidden flex flex-col h-[200px]">
                                    {/* Search field */}
                                    <div className="p-2 border-b border-border bg-surface">
                                        <input
                                            type="text"
                                            placeholder="Rechercher un cours..."
                                            value={courseSearchQuery}
                                            onChange={(e) => setCourseSearchQuery(e.target.value)}
                                            className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    {/* Checklist */}
                                    <div className="flex-1 overflow-y-auto divide-y divide-border/40">
                                        {filteredCourses.length === 0 ? (
                                            <div className="p-4 text-text-muted italic text-xs text-center">
                                                Aucun cours trouvé.
                                            </div>
                                        ) : (
                                            filteredCourses.map((course) => {
                                                const isSelected = selectedCourseIds.includes(course.id);
                                                return (
                                                    <label
                                                        key={course.id}
                                                        className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                                                            isSelected ? "bg-primary/5" : "hover:bg-background/80"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleToggleCourse(course.id)}
                                                            className="h-4 w-4 text-primary rounded border-border focus:ring-primary"
                                                        />
                                                        <span className={`text-xs ${isSelected ? "text-primary font-semibold" : "text-text-main"}`}>
                                                            {course.name}
                                                        </span>
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {sheetType === "admin" && (
                            <div className="bg-background/50 p-4 rounded-lg border border-border/80 text-center text-sm text-text-secondary">
                                Aucun paramètre additionnel requis pour le profil Administrateur.
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-secondary hover:bg-secondary-hover px-5 py-2 text-white font-medium animate-none"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-hover px-5 py-2 text-white font-medium animate-none"
                        >
                            Confirmer
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default UserSheetModal;

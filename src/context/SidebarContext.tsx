import React, { createContext, useState, useContext, useEffect } from "react";

interface SidebarContextType {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    toggleCollapsed: () => void;
    toggleOpen: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebar-collapsed");
        return saved === "true";
    });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    }, [isCollapsed]);

    const toggleCollapsed = () => setIsCollapsed(!isCollapsed);
    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isOpen, setIsOpen, toggleCollapsed, toggleOpen }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

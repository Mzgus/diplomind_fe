import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import SelectProfile from "./pages/SelectProfile";
import MainLayout from "./components/layouts/MainLayout";
import Home from "./pages/Home";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import "./index.css";
import Curriculum from "./pages/Curriculum";
import Classes from "./pages/Classes";
import UserSheets from "./pages/UserSheets";
import Users from "./pages/Users";
import Account from "./pages/Account";
import ProjectSkillsValidation from "./pages/ProjectSkillsValidation";
import RequireAuth from "./components/auth/RequireAuth";
import RequireRole from "./components/auth/RequireRole";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            <Route element={<RequireAuth />}>
              <Route path="/select-profile" element={<SelectProfile />} />
            </Route>

            {/* Private routes with MainLayout */}
            <Route element={<RequireAuth />}>
              <Route element={<MainLayout />}>
                {/* All authenticated users */}
                <Route path="/" element={<Home />} />
                <Route path="/curriculum" element={<Curriculum />} />
                <Route path="/account" element={<Account />} />
                <Route path="/project-skills-validation" element={<ProjectSkillsValidation />} />

                {/* Admin + Teacher */}
                <Route element={<RequireRole allowedRoles={["admin", "teacher"]} />}>
                  <Route path="/classes" element={<Classes />} />
                </Route>

                {/* Admin only */}
                <Route element={<RequireRole allowedRoles={["admin"]} />}>
                  <Route path="/user-sheets" element={<UserSheets />} />
                  <Route path="/users" element={<Users />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


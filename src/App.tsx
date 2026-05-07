import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import SelectProfile from "./pages/SelectProfile";
import MainLayout from "./components/layouts/MainLayout";
import Home from "./pages/Home";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import Courses from "./pages/Courses";
import Project from "./pages/Project";

import Skills from "./pages/Skills";
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
              <Route path="/courses" element={<Courses />} />
              <Route path="/project" element={<Project />} />

              <Route path="/skills" element={<Skills />} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


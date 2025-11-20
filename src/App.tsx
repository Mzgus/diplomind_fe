import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import MainLayout from "./components/layouts/MainLayout";
import Home from "./pages/Home";
import "./index.css";
import Courses from "./pages/Courses";
import Project from "./pages/Project";
import Steps from "./pages/Steps";
import Skills from "./pages/Skills";
import Classes from "./pages/Classes";
import UserSheets from "./pages/UserSheets";
import Users from "./pages/Users";
import Account from "./pages/Account";
import ProjectSkillsValidation from "./pages/ProjectSkillsValidation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique sans Sidebar ni TopNavbar */}
        <Route path="/login" element={<Login />} />

        {/* Routes privées qui utilisent le MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/project" element={<Project />} />
          <Route path="/steps" element={<Steps />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/user-sheets" element={<UserSheets />} />
          <Route path="/users" element={<Users />} />
          <Route path="/account" element={<Account />} />
          <Route
            path="/project-skills-validation"
            element={<ProjectSkillsValidation />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

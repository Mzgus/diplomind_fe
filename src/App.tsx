import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/Login'
import MainLayout from './components/layouts/MainLayout';
import Home from './pages/Home'; // Assumons que vous avez une page Home
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique sans Sidebar ni TopNavbar */}
        <Route path='/login' element={<Login />} />

        {/* Routes privées qui utilisent le MainLayout */}
        <Route element={<MainLayout />}>
          <Route path='/' element={<Home />} />
          {/* Ajoutez vos autres routes privées ici */}
          {/* <Route path='/courses' element={<CoursesPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

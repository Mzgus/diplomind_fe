import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TopNavbar from './components/TopNavbar';
import Login from './pages/Login'
import Home from './pages/Home';
import './index.css'

function App() {

  return (
    <BrowserRouter>
      <TopNavbar/>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/' element={<Home/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TopNavbar from './components/TopNavbar';
import Login from './pages/Login'
// import Home from './pages/Home';
import './index.css'

function App() {

  const userData = {
    name: 'Franchomme Maxime',
    avatar: 'https://i.imgur.com/L5nB0m8.jpeg',
  };

  return (
    <BrowserRouter>
      <TopNavbar userName={userData.name} 
        avatarUrl={userData.avatar}/>
      <Routes>
        <Route path='/login' element={<Login/>} />
        {/* <Route path='/' element={<Home/>} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App

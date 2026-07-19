import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Signup } from './pages/signup'
import { Login } from './pages/login'
import { Ratings } from './pages/ratings'
import { Users } from './pages/users'
import { Stores } from './pages/stores'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/ratings" element={<Ratings/>}/>
      <Route path="/users" element={<Users/>}/>
      <Route path="/stores" element={<Stores/>}/>
    </Routes>
  )
}

export default App

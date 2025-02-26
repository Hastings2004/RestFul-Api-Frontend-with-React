import { BrowserRouter, Routes, Route }  from 'react-router-dom';
import './App.css'
import Home from './components/home';
import Layout from './components/layout';
import Login from './auth/login';
import Register from './auth/register';
import { useContext } from 'react';
import { AppContext } from './context/appContext';
import Create from './courses/create';
import Update from './courses/update';
import View from './courses/view';
import Drop from './courses/testings';

export default function App() {
 
  const {user} = useContext(AppContext)
  
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Layout />}>
          <Route index element={user ? <Home/> : <Login />} />

          <Route path="/login" element={user ? <Home/> : <Login />} />
          <Route path="/register" element={user ? <Home/> : <Register />} />
          <Route path="/create" element={user ? <Create/> : <Login />} />
          <Route path="/new" element={user ? <Drop/> : <Login />} />
          

          <Route path="/courses/:id" element={<View />} />

          <Route path="/courses/update/:id" element={user ? <Update /> : <Login />} />

        </Route>
      </Routes>
      
    </BrowserRouter>
  );
}



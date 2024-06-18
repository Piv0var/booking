import Admin from './Admin';
import Home from './Home';
import Category from './Category';
import Layout from './Layout';
import Location from './Location';
import Room from './Room';
import Privacy from './Privacy';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createContext, useEffect, useState } from 'react';
import './App.css';
export const UserContext = createContext(null);
function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);


  useEffect(() =>{
    //console.log('App Effect');
    const t = window.localStorage.getItem('token');
    if (t) 
      {
        setToken(JSON.parse(t));
    }
    const u = window.localStorage.getItem('user');
    if(u){
      setUser(JSON.parse(u));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user: user, setUser: setUser, token: token, setToken: setToken }}>
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="admin" element={<Admin />} />
    <Route path="privacy" element={<Privacy />} />
    <Route path="category/:slug" element={<Category />} />
    <Route path="location/:slug" element={<Location />} />
    <Route path="room/:slug" element={<Room />} />

    </Route>
  </Routes>
  </BrowserRouter>
  </UserContext.Provider>
  );
}

export default App;

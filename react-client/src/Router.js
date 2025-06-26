import React, { useState, useMemo, useEffect } from 'react';
import { UserContext } from "./UserContext";
import { Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import DashBoard from './pages/DashBoard';
import MapPage from "./pages/MapPage";
import DevicePage from "./pages/DevicePage";
import Navbar from "./Navbar";
import httpClient from './httpClient';


 const Router = () => {
  const [ user, setUser ] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  useEffect(() => {
    httpClient.get("/auth/check")
      .then(response => {})
      .catch(error => {
        console.warn("Session expired, clearing local storage...");
        localStorage.removeItem("user");
        setUser(null);
      })
    /* The former version 
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    */
  }, []); // Removed user as a dependencie with the above changes.
  
  const value = useMemo(() => ({ user, setUser }), [user, setUser]);

  return (
    <>
    <UserContext.Provider value={value}>
      <Navbar />
      <div id="body">
        <Routes>
          <Route path="/" element={<LoginPage />}/>
          <Route path="/dashboard" element={<DashBoard />}></Route>
          <Route path="/map" element={<MapPage />}></Route>
          <Route path="/site-data/:devId" element={<DevicePage />}></Route>
          <Route path="*" element={<NotFound />}/>
        </Routes>
      </div>
    </UserContext.Provider>
    </>
  );
 };

 export default Router;
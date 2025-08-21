import React, { useContext, useEffect } from 'react';
import { UserContext, UserProvider } from "./UserContext";
import { Routes, Route, useNavigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import DashBoard from './pages/DashBoard';
import MapPage from "./pages/MapPage";
import DevicePage from "./pages/DevicePage";
import Navbar from "./Navbar";


const AppRoutes = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && window.location.pathname !== '/') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <>
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
    </>
  );
};


 const Router = () => {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
 };
 export default Router;
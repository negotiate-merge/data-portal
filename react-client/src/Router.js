import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";
import DevicePage from "./pages/DevicePage";
import Navbar from "./Navbar";

 const Router = () => {
  return (
    <>
    <Navbar />
    <div className="container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />}/>
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/me" element={<LandingPage />}/>
          <Route path="/map" element={<MapPage />}></Route>
          <Route path="/site-data/:devId" element={<DevicePage />}></Route>
          <Route path="*" element={<NotFound />}/>
        </Routes>
      </BrowserRouter>
    </div>
    </>
  );
 };

 export default Router;
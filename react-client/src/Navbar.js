import React, { useContext } from "react";
import httpClient from "./httpClient";
import { UserContext } from "./UserContext";

 function Navbar() {
  const { user } = useContext(UserContext);

    const logoutUser = async () => {
    try {
      const resp = await httpClient.post("/logout");
      console.log("Logout response: ", resp.data);
      localStorage.removeItem("user");
      // window.location.href = "/";
    } catch (error) {
      console.error("Error during logout: ", error);
    }
  };

  return <nav className="navbar navbar-expand-lg sticky-top bg-body-tertiary" data-bs-theme="dark">
  <div className="container">
    <a className="navbar-brand" href="/">Pipe Metrix</a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      { user && (
        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 dropdown-menu-end">
          <li className="nav-item dropdown-item">
            <a className="nav-link active" aria-current="page" href="/dashboard">Dashboard</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/map">Map</a>
          </li>
          <li className="nav-item">
            <a className="nav-link disabled" aria-disabled="true" href="">Settings</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/" onClick={logoutUser}>Logout</a>
          </li>
      </ul>
      )}
    </div>
  </div>
</nav>
}

export default Navbar;
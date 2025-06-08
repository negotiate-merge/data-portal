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

  return <nav className="navbar navbar-expand-lg sticky-top bg-body-tertiary">
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
            <a className="nav-link disabled" aria-disabled="true">Settings</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/" onClick={logoutUser}>Logout</a>
          </li>
          {/*}
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Dropdown
            </a>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">Action</a></li>
              <li><a className="dropdown-item" href="#">Another action</a></li>
              <li><hr className="dropdown-divider"/></li>
              <li><a className="dropdown-item" href="#">Something else here</a></li>
            </ul>
          </li>
          */}
      </ul>
      )}
    </div>
  </div>
</nav>
    
  {/*}
  <nav className="nav">
    <a href="/" className="site-title">Pipe Metrix</a>
      <button className="burger" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>
    { user && (
      <ul className={`nav-links ${isOpen ? "open" : ""}`}>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/map">Map</a></li>
        <li><a href="/" onClick={logoutUser}>Logout</a></li>
      </ul>
    )}
  </nav>
  */}
}

export default Navbar;
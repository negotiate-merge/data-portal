import React, { useContext } from "react";
import httpClient from "./httpClient";
import { UserContext } from "./UserContext";

 function Navbar() {
  const { user } = useContext(UserContext);

    const logoutUser = async () => {
    try {
      const resp = await httpClient.post("http://192.168.19.4:5000/logout");
      console.log("Logout response: ", resp.data);
      localStorage.removeItem("user");
      // window.location.href = "/";
    } catch (error) {
      console.error("Error during logout: ", error);
    }
  };

  return <nav className="nav">
    <a href="/" className="site-title">Data Store</a>
    { user && (
      <ul>
        <li>
          <a href="/map" >Map</a>
        </li>
        <li>
          <a href="/" onClick={logoutUser}>Logout</a>
        </li>
      </ul>)
    }
  </nav>
}

export default Navbar;
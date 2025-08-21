import { useContext } from "react";
import { UserContext } from "./UserContext";

 function Navbar() {
  const { user, logout } = useContext(UserContext);

  // const logoutUser = async () => {
  //   try {
  //     // const resp = await httpClient.post("/logout");  // This needs to be reworked on the backend to revoke access
  //     setUser(null);
  //     localStorage.removeItem('access_token');
  //     console.log("Logout response: ", resp.data);
  //   } catch (error) {
  //     console.error("Error during logout: ", error);
  //   }
  // };

  return <nav className="navbar navbar-expand-lg sticky-top bg-body-tertiary" data-bs-theme="dark">
  <div className="container-fluid">
    <a className="navbar-brand" href="/">Pipe Metrix</a>

    { user && (
      <>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
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
              <a className="nav-link" href="/" onClick={logout}>Logout</a>
            </li>
          </ul>
        </div>
      </>
    )}
  </div>
</nav>
}
export default Navbar;
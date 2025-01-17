import React, { useState, useEffect } from "react";
import httpClient from "../httpClient";

const LandingPage = () => {
  const [ user, setUser ] = useState(null);

  const logoutUser = async () => {
    try {
      const response = await httpClient.post("http://192.168.19.4:5000/logout");
      console.log("Logout response: ", response.data);
      window.location.href = "/"; //replace("/");
    } catch (error) {
      console.error("Error during logout: ", error);
    }
    
  };

  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get('http://192.168.19.4:5000/@me');
        setUser(resp.data);
        console.log(resp.data)
        console.log('user state has: ', user);
      } catch (err) {
        console.log("Not authenticated");
      }
    })();
  }, []);


  return (
    <div className="center">
      <h1>Welcome to this React Application</h1>
      { user != null ? (
        <div>
          <h2>Logged in</h2>
          <h3>ID: {user.id}</h3>
          <h3>Email: {user.email}</h3>
          <button onClick={logoutUser}>Logout</button>
        </div>
      ) : (
        <div>
          <p>You are not logged in</p>
          <div>
            <a href="/login">
              <button>Log in</button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
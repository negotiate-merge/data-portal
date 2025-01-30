import React, { useState, useEffect } from "react";
import httpClient from "../httpClient";
import { Link } from 'react-router-dom';
import Navbar from "../Navbar";

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
    <div className="me center">
      { user != null ? (
        <div>
          <h1>Welcome {user.email} to the IoT sensor data portal</h1>
          <h3>Email: {user.email}</h3>
          <button onClick={logoutUser}>Logout</button>
          <Link to={'/map'}>Go to map</Link>
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
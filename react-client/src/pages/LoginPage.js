import React, { useContext, useState } from 'react';
import httpClient from '../httpClient';
import { UserContext } from '../UserContext';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser } = useContext(UserContext)

  const logInUser = async () => {
    try{
      const resp = await httpClient.post('/login', {
        email,
        password,
      });
      setUser(resp.data)
      localStorage.setItem("user", JSON.stringify(resp.data));
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Response object:", err.response);
      console.error("Status:", err.response?.status);

      if (err.response?.status === 401) {
        alert("Invalid Credentials");
      } else {
        console.error("Login error:", err);
      }
    }
  }

  const logInExample = async () => {
    try{
      const resp = await httpClient.post('/example-site');
      setUser(resp.data)
      localStorage.setItem("user", JSON.stringify(resp.data));
      window.location.href = "/map";
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Response object:", err.response);
      console.error("Status:", err.response?.status);

      if (err.response?.status === 401) {
        alert("Invalid Credentials");
      } else {
        console.error("Login error:", err);
      }
    }
  }

  if (!user) {
    return (
      <div className='center'>
        <h1 style={{ marginBottom: "12px" }}>Log in to Pipe Metrix</h1>
        <form
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              logInUser();
            }
          }}>
          <div className='form-group space'>
            <input autoComplete='off' autoFocus className='form-control' placeholder='Email' type="text" value={email} 
              onChange={(e) => setEmail(e.target.value)} id="Email" />
          </div>
          <div className='form-group'>
            <input className='form-control space' placeholder='Password' type="password" value={password} 
              onChange={(e) => setPassword(e.target.value)} id="passwd" />
          </div>
          <button id="login-btn" className='btn btn-dark space' type="button" 
            onClick={() => logInUser()}>Login</button>
        </form>
          <div style={{ marginTop: "20px" }}>
            <p style={{ marginBottom: "0" }}>Take a look at the Demonstration</p>
            <button id="example" className='btn btn-secondary space' type="button" 
            onClick={() => logInExample()}>Login as guest</button>
          </div>
      </div>
    );
  }
};

export default LoginPage;

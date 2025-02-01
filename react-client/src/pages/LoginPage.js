import React, { useContext, useState } from 'react';
import httpClient from '../httpClient';
import { UserContext } from '../UserContext';
import { json } from 'd3';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser } = useContext(UserContext)

  const logInUser = async () => {
    console.log(email, password);

    try{
      const resp = await httpClient.post('http://192.168.19.4:5000/login', {
        email,
        password,
      });
      setUser(resp.data)
      localStorage.setItem("user", JSON.stringify(resp.data));
      window.location.href = "/map";
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Response object:", err.response);
      console.error("Status:", err.response?.status);

      if (err.repsonse?.status === 401) {
        alert("Invalid Credentials");
      } else {
        console.error("Login error:", err);
      }
    }
  }

  if (user) console.log('user @ login page is:', user.email);

  if (user) return (
    <div>
      {user.email} is logged in
    </div>
  )
  
  return (
    <div className='center'>
      <h1>Log in to Data Store</h1>
      <form>
        <div className='form-group space'>
          <input autoComplete='off' autoFocus className='form-control' placeholder='Email' type="text" value={email} 
            onChange={(e) => setEmail(e.target.value)} id="Email" />
        </div>
        <div className='form-group'>
          <input className='form-control space' placeholder='Password' type="password" value={password} 
            onChange={(e) => setPassword(e.target.value)} id="passwd" />
        </div>
        <button id="login-btn" className='btn btn-dark space' type="button" 
          onClick={() => logInUser()}>Submit</button>
      </form>
    </div>
  );
};

export default LoginPage;

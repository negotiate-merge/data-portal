import React, { useState } from 'react';
import httpClient from '../httpClient';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const logInUser = async () => {
    console.log(email, password);

    try{
      const resp = await httpClient.post('http://192.168.19.4:5000/login', {
        email,
        password,
      });
      
      window.location.href = "/map";
    } catch (err) {
      if (err.repsonse.status === 401) {
        alert("Invalid Credentials");
      }
    }
  }
    
  return (
    <div>
      <h1>Log in to your account</h1>
      <form>
        <div>
          <label>Email: </label>
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} id="email" />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} id="passwd" />
        </div>
        <button type="button" onClick={() => logInUser()}>Submit</button>
      </form>
    </div>
  );
};

export default LoginPage;

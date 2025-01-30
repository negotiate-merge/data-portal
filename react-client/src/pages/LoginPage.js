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
      
      window.location.href = "/me";
    } catch (err) {
      if (err.repsonse.status === 401) {
        alert("Invalid Credentials");
      }
    }
  }
    
  return (
    <div className='center'>
      <h1>Log in to Data Store</h1>
      <form>
        <div className='form-group'>
          <input autoComplete='off' autoFocus className='form-control' placeholder='Email' type="text" value={email} 
            onChange={(e) => setEmail(e.target.value)} id="Email" />
        </div>
        <div className='form-group'>
          <input className='form-control' placeholder='Password' type="password" value={password} 
            onChange={(e) => setPassword(e.target.value)} id="passwd" />
        </div>
        <button className='btn btn-dark' type="button" onClick={() => logInUser()}>Submit</button>
      </form>
    </div>
  );
};

export default LoginPage;

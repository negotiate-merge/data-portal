import { useContext, useEffect, useState } from 'react';
import httpClient from '../httpClient';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, login } = useContext(UserContext)

  const logInUser = async (demo) => {
    try {
      // Demo arg defaults to demo app being loaded
      const resp = await httpClient.post((!demo ? '/login' : '/example-site'), {
        email,
        password,
      });
      login(resp.data.access_token);
    } catch (err) {
      // REDUCE THE VERBOSITY OF THESE WHEN APROPRIATE
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

  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      // Navigate to dashboard upon authentication 
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  if (!user) {
    return (
      <div className='center login-container s-card'>
        <p style={{ marginBottom: "12px", fontSize: "1.25rem" }}>Log in to Pipe Metrix</p>
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
            onClick={() => logInUser(null)}>Login</button>
        </form>
          <div style={{ marginTop: "20px" }}>
              <button id="example" className='btn btn-secondary space' type="button" 
              onClick={() => logInUser('demo')}>See Demonstration</button>
          </div>
      </div>
    )
  };
}
export default LoginPage;

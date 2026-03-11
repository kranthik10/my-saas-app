import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [useEmailPassword, setUseEmailPassword] = useState(true);

  const navigate = useNavigate();
  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      alert('Login failed');
    }
  };

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    const success = await signInWithGoogle();
    if (!success) {
      alert('Google login failed');
    }
  };

  return (
    <div className="form-container">
      <h1>Account Login</h1>
      
      {!useEmailPassword ? (
        <div>
          <button onClick={handleGoogleLogin} className="btn btn-primary btn-google">
            Sign in with Google
          </button>
          <p className="my-1">
            Prefer email & password? <a href="#" onClick={() => setUseEmailPassword(true)}>Sign in manually</a>
          </p>
        </div>
      ) : (
        <div>
          <button onClick={handleGoogleLogin} className="btn btn-primary btn-google">
            Sign in with Google
          </button>
          <p className="my-2">OR</p>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email Address"
                name="email"
                value={email}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={onChange}
                required
                minLength="6"
              />
            </div>
            <input type="submit" className="btn btn-primary" value="Login" />
          </form>
          <p className="my-1">
            Don't have an account? <a href="/register">Sign Up</a>
          </p>
          <p className="my-1">
            <a href="#" onClick={() => setUseEmailPassword(false)}>Use Google instead</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
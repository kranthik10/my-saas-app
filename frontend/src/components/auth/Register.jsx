import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { register, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
  const [useEmailPassword, setUseEmailPassword] = useState(true);

  const navigate = useNavigate();
  const { name, email, password, password2 } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    
    if (password !== password2) {
      alert('Passwords do not match');
      return;
    }
    
    const success = await register(name, email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      alert('Registration failed');
    }
  };

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    const success = await signInWithGoogle();
    if (!success) {
      alert('Google signup failed');
    }
  };

  return (
    <div className="form-container">
      <h1>Account Register</h1>
      
      {!useEmailPassword ? (
        <div>
          <button onClick={handleGoogleLogin} className="btn btn-primary btn-google">
            Sign up with Google
          </button>
          <p className="my-1">
            Prefer email & password? <a href="#" onClick={() => setUseEmailPassword(true)}>Sign up manually</a>
          </p>
        </div>
      ) : (
        <div>
          <button onClick={handleGoogleLogin} className="btn btn-primary btn-google">
            Sign up with Google
          </button>
          <p className="my-2">OR</p>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Name"
                name="name"
                value={name}
                onChange={onChange}
                required
              />
            </div>
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
                minLength="6"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Confirm Password"
                name="password2"
                value={password2}
                onChange={onChange}
                minLength="6"
              />
            </div>
            <input type="submit" className="btn btn-primary" value="Register" />
          </form>
          <p className="my-1">
            Already have an account? <a href="/login">Sign In</a>
          </p>
          <p className="my-1">
            <a href="#" onClick={() => setUseEmailPassword(false)}>Use Google instead</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default Register;
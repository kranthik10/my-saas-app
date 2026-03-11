import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const authLinks = (
    <ul>
      <li>
        <Link to="/dashboard">Dashboard</Link>
      </li>
      <li>
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul>
      <li>
        <Link to="/login">Login</Link>
      </li>
      <li>
        <Link to="/register">Register</Link>
      </li>
    </ul>
  );

  return (
    <header className="header">
      <h1>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Video Processing SaaS
        </Link>
      </h1>
      <nav>
        {isAuthenticated ? authLinks : guestLinks}
      </nav>
    </header>
  );
};

export default Header;
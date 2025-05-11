import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isAuthenticated, logout }) => {
  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <Link to="/" style={brandStyle}>Task Manager</Link>
        <div>
          {isAuthenticated ? (
            <button onClick={logout} style={buttonStyle}>Logout</button>
          ) : (
            <>
              <Link to="/login" style={linkStyle}>Login</Link>
              <Link to="/register" style={linkStyle}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const navStyle = {
  background: '#333',
  color: 'white',
  padding: '10px 0'
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
};

const brandStyle = {
  color: 'white',
  fontWeight: 'bold',
  fontSize: '20px',
  textDecoration: 'none',
};

const linkStyle = {
  color: 'white',
  marginLeft: '15px',
  textDecoration: 'none',
};

const buttonStyle = {
  background: 'transparent',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  fontSize: '16px',
};

export default Navbar;

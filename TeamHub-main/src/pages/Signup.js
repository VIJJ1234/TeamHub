import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import userApi from '../apis/services/userApi';
import { AuthContext } from '../context/AuthContext';

function Signup() {
  const { setIsLoggedIn, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password match check
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');

    try {
      const response = await userApi.registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      // On success, set user data and redirect
      if (response?.data?.user) {
        setIsLoggedIn(true);
        updateUser(response.data.user);
        navigate('/');
      } else {
        // If no user data in response, redirect to login
        navigate('/login');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="App">
      <h2 className="welcome-text-signup">Welcome to TeamHub, Please Register!</h2>

      <div className="signup-box">
        <form className="add-profile-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Re-type Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit">Sign Up</button>
        </form>

        {/* Already have an account */}
        <p style={{ marginTop: '1rem' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;

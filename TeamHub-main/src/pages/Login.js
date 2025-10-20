import React, { useState, useContext, useEffect } from 'react';
import '../App.css';
import userApi from '../apis/services/userApi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // ✅ error state
  const { setIsLoggedIn, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await userApi.getUserProfile();
        if (response?.data?.user) {
          setIsLoggedIn(true);
          updateUser(response.data.user);
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, [navigate, setIsLoggedIn, updateUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // clear old errors

    try {
      const response = await userApi.signInUser({ email: username, password });
      if (response?.data?.user) {
        setIsLoggedIn(true);
        updateUser(response.data.user);
        navigate('/');
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || 'Login failed');
      } else {
        setErrorMessage(error.message || 'Something went wrong');
      }
    }
  };

  return (
    <div className="login-page-container dark-theme">
      <h1 className="login-heading">Welcome to TeamHub</h1>
      <div className="login-box">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* ✅ Error Message Display */}
          {errorMessage && (
            <p style={{ color: 'red', fontSize: '14px', marginTop: '5px', marginBottom: '10px' }}>
              {errorMessage}
            </p>
          )}

          <button type="submit" className="login-button">Login</button>
          <button type="button" className="forgot-password-button">Forgot Password?</button>
        </form>
      </div>
    </div>
  );
}

export default Login;

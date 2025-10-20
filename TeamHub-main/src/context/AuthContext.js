import { createContext, useState, useEffect } from 'react';
import userApi from '../apis/services/userApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setLoading(true);
        const res = await userApi.getUserProfile();
        if (res?.data?.user) {
          setIsLoggedIn(true);
          setCurrentUser(res.data.user);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoggedIn(false);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const updateUser = (userData) => {
    setCurrentUser(userData);
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      setIsLoggedIn, 
      currentUser, 
      updateUser, 
      loading,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

import { createContext, useState, useEffect } from "react";

export const UserContext = createContext(null);

export const UserProvider = ({children}) => {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage on app start
    try {
      const savedToken = localStorage.getItem('jwt');
      return savedToken ? { jwt: savedToken } : null;
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  });
  
  const [loading, setLoading] = useState(false);

  // Save to localStorage when user changes
  useEffect(() => {
    if (user?.jwt) {
      localStorage.setItem('jwt', user.jwt);
    } else {
      localStorage.removeItem('jwt');
    }
  }, [user]);

  const login = (tokenOrUserData) => {
    if (typeof(tokenOrUserData === 'string')) {
      setUser({ jwt: tokenOrUserData });
    } else {
      setUser(tokenOrUserData);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jwt');
  };

  const isTokenExpired = (token) => {
    const tokenToCheck = token || user?.jwt;
    if (!tokenToCheck) return true;
    try {
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true; // Consider expired
    }
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    setLoading,
    isTokenExpired
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

 
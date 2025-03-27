import { createContext, useContext, useState, useEffect } from 'react';
import checkAuth from '@/app/actions/checkAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser , setCurrentUser ] = useState(null);
  const [roles, setRoles] = useState({
    isAdmin: false,
    isFoodstall: false,
    isCustomer: false,
    isSuperAdmin: false,
  });

  const checkAuthentication = async () => {
    const { isAuthenticated, user, roles } = await checkAuth();
    setIsAuthenticated(isAuthenticated);
    setCurrentUser (user);
    setRoles(
      roles || {
        isAdmin: false,
        isCustomer: false,
        isFoodstall: false,
        isSuperAdmin: false, 
      }
    );
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setRoles({
      isAdmin: false,
      isCustomer: false,
      isFoodstall: false,
      isSuperAdmin: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        roles,
        setIsAuthenticated,
        setCurrentUser,
        setRoles,
        checkAuthentication, // Expose the checkAuthentication function
        handleLogout, // Expose the logout function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { createContext, useContext, useState, useEffect } from 'react';
import checkAuth from '@/app/actions/checkAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [roles, setRoles] = useState({
    isAdmin: false,
    isFoodstall: false,
    isCustomer: false,
    isSuperAdmin: false,
  });

  useEffect(() => {
    const checkAuthentication = async () => {
      const { isAuthenticated, user, roles } = await checkAuth();
      setIsAuthenticated(isAuthenticated);
      setCurrentUser(user);
      setRoles(
        roles || {
          isAdmin: false,
          isCustomer: false,
          isFoodstall: false,
          isSuperAdmin: false, 
        }
      );
    };

    checkAuthentication();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        roles,
        setIsAuthenticated,
        setCurrentUser,
        setRoles,
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

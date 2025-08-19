import { createContext, useContext, useState, useEffect } from 'react';
import checkAuth from '@/app/actions/checkAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [labels, setLabels] = useState([]);
  const [cartCount, setCartCount] = useState(0); 

  const checkAuthentication = async () => {
    const { isAuthenticated, user, labels } = await checkAuth();
    setIsAuthenticated(isAuthenticated);
    setCurrentUser(user);
    setLabels(labels || []);
  };

  useEffect(() => {
    checkAuthentication();

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(count);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLabels([]);
    setCartCount(0);
  };

  const roles = {
    isAdmin: labels.includes('admin'),
    isCustomer: labels.includes('customer'),
    isFoodstall: labels.includes('foodstall'),
    isGuest: labels.includes('guest'),
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        labels,
        roles,
        cartCount, 
        setCartCount,
        setIsAuthenticated,
        setCurrentUser,
        setLabels,
        checkAuthentication,
        handleLogout,
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

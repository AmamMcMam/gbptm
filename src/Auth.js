import React, { useState, useEffect, useContext } from 'react';
import createAuth0Client from '@auth0/auth0-spa-js';

import history from './history';

const PERMISSIONS_STORAGE_KEY = 'https://toiletmap.org.uk/permissions';

const redirectOnNextLogin = (location) => {
  localStorage.setItem('redirectOnLogin', JSON.stringify(location));
};

const onRedirectCallback = () => {
  const redirectTo = JSON.parse(localStorage.getItem('redirectOnLogin'));
  history.replace(redirectTo || '/');
};

export const AuthContext = React.createContext();
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children, ...props }) => {
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [user, setUser] = useState();
  const [auth0Client, setAuth0] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth0 = async () => {
      const auth0FromHook = await createAuth0Client(props);
      setAuth0(auth0FromHook);

      if (
        window.location.search.includes('code=') &&
        window.location.search.includes('state=')
      ) {
        const { appState } = await auth0FromHook.handleRedirectCallback();
        onRedirectCallback(appState);
      }

      const isAuthenticated = await auth0FromHook.isAuthenticated();

      setIsAuthenticated(isAuthenticated);

      if (isAuthenticated) {
        const user = await auth0FromHook.getUser();
        setUser(user);
      }

      setLoading(false);
    };
    initAuth0();
    // eslint-disable-next-line
  }, []);

  const handleRedirectCallback = async () => {
    setLoading(true);
    await auth0Client.handleRedirectCallback();
    const user = await auth0Client.getUser();
    setLoading(false);
    setIsAuthenticated(true);
    setUser(user);
  };

  const checkPermission = (permissionType) => {
    const permissions = user[PERMISSIONS_STORAGE_KEY] || [];
    return permissions.includes(permissionType);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        redirectOnNextLogin,
        handleRedirectCallback,
        checkPermission,
        loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
        getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
        logout: (...p) =>
          auth0Client.logout(
            {
              returnTo: window.location.origin,
            },
            ...p
          ),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

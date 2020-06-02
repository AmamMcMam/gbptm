import React, { useState, useEffect, useContext } from 'react';
import createAuth0Client from '@auth0/auth0-spa-js';

import history from './history';

const CLIENT_ID = 'sUts4RKy04JcyZ2IVFgMAC0rhPARCQYg';
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
  const [auth0Client, setAuth0] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth0 = async () => {
      const auth0FromHook = await createAuth0Client({
        domain: 'gbptm.eu.auth0.com',
        client_id: CLIENT_ID,
        redirect_uri: `${window.location.origin}/callback`,
        cacheLocation: 'localstorage',
        audience: 'https://www.toiletmap.org.uk/graphql',
        scope: 'openid profile report:loo',
      });
      setAuth0(auth0FromHook);

      if (
        window.location.search.includes('code=') &&
        window.location.search.includes('state=')
      ) {
        const { appState } = await auth0FromHook.handleRedirectCallback();
        onRedirectCallback(appState);
      }

      const isAuthenticated = await auth0FromHook.isAuthenticated();

      if (isAuthenticated) {
        const user = await auth0FromHook.getUser();
        setUser(user);
      }

      setIsAuthenticated(isAuthenticated);
      setLoading(false);
    };

    initAuth0();
  }, []);

  const handleRedirectCallback = async () => {
    setLoading(true);
    await auth0Client.current.handleRedirectCallback();
    const user = await auth0Client.current.getUser();
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
        loginWithRedirect: (...p) =>
          auth0Client.current.loginWithRedirect(...p),
        getTokenSilently: (...p) => auth0Client.current.getTokenSilently(...p),
        logout: (...p) =>
          auth0Client.current.logout(
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

import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { useAuth } from '../Auth';
import PageLoading from './PageLoading';

const ProtectedRoute = ({ component: Component, injectProps, ...rest }) => {
  const auth = useAuth();

  if (auth.loading) {
    return <PageLoading />;
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        if (auth.isAuthenticated) {
          return <Component {...props} {...injectProps} />;
        } else {
          auth.redirectOnNextLogin(props.location);
          return <Redirect to="/contribute" />;
        }
      }}
    />
  );
};

export default ProtectedRoute;

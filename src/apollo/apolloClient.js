import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  gql,
} from '@apollo/client';
import { onError } from '@apollo/link-error';
import { setContext } from '@apollo/link-context';

import localSchema from '../localSchema';
import { version } from '../../package.json';
import { isAuthenticated, getAccessToken } from '../Auth';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_BAKED_BACKEND || '/api',
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: isAuthenticated() ? `Bearer ${getAccessToken()}` : '',
    },
  };
});

export default function createApolloClient(initialState, ctx) {
  // The `ctx` (NextPageContext) will only be present on the server.
  // use it to extract auth headers (ctx.req) or similar.

  console.log('init apollo client');

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Return existing cached data for find by id queries (use `returnPartialData` option)
          loo(existingData, { args, toReference }) {
            return (
              existingData || toReference({ __typename: 'Loo', id: args.id })
            );
          },
        },
      },
    },
  });

  cache.restore(initialState);

  cache.writeQuery({
    query: gql`
      query {
        mapZoom
        mapRadius
        mapCenter {
          lat
          lng
        }
        geolocation {
          lat
          lng
        }
      }
    `,
    data: {
      mapZoom: 16,
      mapRadius: 1000,
      mapCenter: {
        __typename: 'Point',
        lat: 0,
        lng: 0,
      },
      geolocation: null,
    },
  });

  console.log(cache.extract());

  return new ApolloClient({
    name: '@toiletmap/ui',
    version,
    ssrMode: Boolean(ctx),
    link: ApolloLink.from([errorLink, authLink, httpLink]),
    connectToDevTools: true,
    cache,
    ...localSchema,
  });
}

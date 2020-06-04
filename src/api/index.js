import { ApolloServer } from 'apollo-server-micro';
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const settings = require('./config');

const fs = require('fs');
const path = require('path');
import typeDefs from './typeDefs.graphql.js';

const resolvers = require('./resolvers');
const {
  RequirePermissionDirective,
  RedactionDirective,
} = require('./directives');

const client = jwksClient({
  jwksUri: settings.auth0.jwksUri,
});

const { connect } = require('./db');
connect(process.env.MONGODB_URI);

function getKey(header, cb) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    cb(null, signingKey);
  });
}

const options = {
  audience: settings.auth0.audience,
  issuer: settings.auth0.issuer,
  algorithms: settings.auth0.algorithms,
};

// Add GraphQL API
const apollo = new ApolloServer({
  // These will be defined for both new or existing servers
  typeDefs: typeDefs,
  resolvers,
  schemaDirectives: {
    auth: RequirePermissionDirective,
    redact: RedactionDirective,
  },
  context: async ({ req }) => {
    let user = null;
    const authorization = req.headers.authorization;
    if (authorization) {
      const token = authorization.replace('Bearer ', '');
      user = await new Promise((resolve, reject) => {
        jwt.verify(token, getKey, options, (err, decoded) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded);
        });
      });
    }
    return {
      user,
    };
  },
  engine: { ...settings.graphql.engine },
  playground: { ...settings.graphql.playground },
  introspection: true,
});

export default apollo;

const { express: voyagerMiddleware } = require('graphql-voyager/middleware');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const config = require('../config');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const {
  RequirePermissionDirective,
  RedactionDirective,
} = require('./directives');

const client = jwksClient({
  jwksUri: config.auth0.jwksUri,
});

function getKey(header, cb) {
  client.getSigningKey(header.kid, function(err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    cb(null, signingKey);
  });
}

const options = {
  audience: config.auth0.audience,
  issuer: config.auth0.issuer,
  algorithms: config.auth0.algorithms,
};

// Add GraphQL API
const apollo = new ApolloServer({
  // These will be defined for both new or existing servers
  typeDefs,
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
  engine: { ...config.graphql.engine },
  playground: { ...config.graphql.playground },
  introspection: true,
});

const applyMiddleware = app => {
  apollo.applyMiddleware({ app });
  // Add voyager for graphql
  app.use('/voyager', voyagerMiddleware({ endpointUrl: '/graphql' }));
};

module.exports = applyMiddleware;

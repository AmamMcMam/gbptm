require('newrelic');
const config = require('./config/config');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
const app = express();

const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./graphql/schema');

// we can make some nicer assumptions about security if query values are only
// ever strings, not arrays or objects
app.set('query parser', 'simple');

// Redirect to https in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.hostname !== 'www.toiletmap.org.uk') {
      res.redirect(301, 'https://www.toiletmap.org.uk' + req.originalUrl);
    } else if (req.headers['x-forwarded-proto'] !== 'https') {
      res.redirect(301, 'https://' + req.hostname + req.originalUrl);
    } else {
      next();
    }
  } else {
    next();
  }
});

app.use(helmet());
app.use(compression());
app.use(cors());

// Add GraphQL API
const apollo = new ApolloServer({
  // These will be defined for both new or existing servers
  typeDefs,
  resolvers,
});
apollo.applyMiddleware({ app });

// Add API routes
const routes = require('./routes');
app.use('/api', routes);

// Serve the built admin UI from /admin
app.use('/admin', express.static(path.join(__dirname, 'www-admin')));
app.get('/admin/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'www-admin', 'index.html'));
});

// Serve the built UI from the root
app.use(express.static(path.join(__dirname, 'www')));
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

// auto-init if this app is not being initialised by another module
if (!module.parent) {
  app.listen(config.app.port, () => {
    /* eslint-disable-next-line no-console */
    console.log(`Listening on port ${config.app.port}`);
    console.log(`Graphql on ${apollo.graphqlPath}`);
  });
}

module.exports = app;

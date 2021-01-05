const { ApolloServer, PubSub } = require('apollo-server');
const mongoose = require('mongoose');
const { MONGODB } = require('./config');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const PORT = process.env.PORT || 5000;
const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub })
})

mongoose.connect(MONGODB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}, () => {
  console.log('Base de datos conectada')
})

server.listen(PORT, () => {
  console.log('Servidor corriendo en el puerto 4000');
})
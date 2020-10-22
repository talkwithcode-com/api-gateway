if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { GraphQLServer, PubSub } = require("graphql-yoga");
const { importSchema } = require("graphql-import");
const axios = require("axios").default;
const Redis = require("ioredis");
const redis = new Redis(6379, 'redis-server')

const { Query } = require("./resolvers/Query");
const { Mutation } = require("./resolvers/Mutation");
const { Subscription } = require("./resolvers/Mutation");

const questionUserService = axios.create({
  baseURL: "http://35.240.166.181:3000",
});
const codexService = axios.create({ baseURL: "http://35.247.134.61" });
const pubsub = new PubSub();

const startServer = async () => {
  const server = new GraphQLServer({
    typeDefs: importSchema("./schema.graphql"),
    resolvers: { Query, Mutation, Subscription },
    context: { pubsub, redis, questionUserService, codexService },
  });

  await server.start(({ port }) => {
    console.log(`Server on http:localhost:${port}`);
  });
};

startServer();

module.exports = startServer;

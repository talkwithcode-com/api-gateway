if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { GraphQLServer, PubSub } = require("graphql-yoga");
const { importSchema } = require("graphql-import");
const axios = require("axios").default;
const Redis = require("ioredis");
const redis = new Redis();

const Query = require("./resolvers/Query");
const { Mutation } = require("./resolvers/Mutation");
const { Subscription } = require("./resolvers/Mutation");

const questionUserService = axios.create({ baseURL: "http://localhost:3000/" });
const codexService = axios.create({ baseURL: "http://localhost:5002/" });

const pubsub = new PubSub();
const server = new GraphQLServer({
  typeDefs: importSchema("./schema.graphql"),
  resolvers: { Query, Mutation, Subscription },
  context: { pubsub, redis, questionUserService, codexService },
});

server.start(({ port }) => {
  console.log(`Server on http:localhost:${port}`);
});

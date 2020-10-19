const { GraphQLServer, PubSub } = require('graphql-yoga');
const { typeDefs, resolvers } = require('./schema/schema')

const pubsub = new PubSub()
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });
server.start(({ port }) => {
    console.log(`Server on http:localhost:${port}`)
})
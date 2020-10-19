const Redis = require("ioredis");
const redis = new Redis();
const axios = require('axios')
const userQuestionUrl = "http://localhost:5001"
const codexUrl = "http://localhost:5002"

const typeDefs = `
type Question {
    _id: ID
    timeLimit: Float
    title: String
    score: String
    description: String
    user_id: String
    sample_solustions: [SampleSolution]
    solutions: [Solution]
}

type SampleSolution {
    _id: ID
    input: String
    output: String
}

type Solution {
    _id: ID
    input: String
    output: String
}

type Code {
    id: ID
    user: String
    content: String
}

type Query {
    questions: [Question]
    sample_solutions: [SampleSolution]
    solutions: [Solution]
    code: Code
    codes: [Code!]
}

type Mutation {
    addQuestion(timeLimit: Float, title: String, score: String, description: String, user_id: String) : Question
    deleteQuestion(question_id: ID) : Question
    updateQuestion(question_id: ID, timeLimit: Float, title: String, score: String, description: String) : Question
    addSampleSolution(input: String, output: String) : SampleSolution
    deleteSampleSolution(solution_id: ID, question_id: ID): SampleSolution
    updateSampleSolution(solution_id: ID, input: String, output: String): SampleSolution
    addSolution(input: String, output: String): Solution
    deleteSolution(solution_id: ID, question_id: ID): Solution
    updateSolution(solution_id: ID, input: String, output: String): Solution
    postCode(user: String!, content: String!) : ID!
}

type Subscription {
    code: Code
}
`

let code = {}
const codes = []
const subscribers = []
const onCodeUpdates = (fn) => subscribers.push(fn)

const resolvers = {
    Query: {
        questions: async () => {
            const questionsCache = await redis.get("questions")
            try {
                if(questionsCache !== null){
                    return JSON.parse(questionsCache)
                } else {
                    const { data } = await axios.get(userQuestionUrl)
                    await redis.set("questions", JSON.stringify(data.questions))
                    return data.questions
                }
            } catch (error) {
                return error
            }
        },
        sample_solutions: async () => {
            const sampleSolutionsCache = await redis.get("sampleSolutions")
            try {
                if(sampleSolutionsCache !== null){
                    return JSON.parse(sampleSolutionsCache)
                } else {
                    const { data } = await axios.get(userQuestionUrl)
                    await redis.set("sampleSolutions", JSON.stringify(data.solution))
                    return data.solution
                }
            } catch (error) {
                return error
            }
        },
        solutions: async () => {
            const solutionsCache = await redis.get("solutions")
            try {
                if(solutionsCache !== null){
                    return JSON.parse(solutionsCache)
                } else {
                    const { data } = await axios.get(userQuestionUrl)
                    await redis.set("solutions", JSON.stringify(data.solution))
                    return data.solution
                }
            } catch (error) {
                return error
            }
        },
        code: () => code,
        codes: () => codes,
    },
    Mutation: {
        async addQuestion(_, args){
            try {
                const { data } = await axios.post(userQuestionUrl, args)
                redis.del("questions")
                return data
            } catch (error) {
                return error
            }
        },
        async addSampleSolution(_, args){
            try {
                const { data } = await axios.post(userQuestionUrl, args)
                redis.del("sampleSolutions")
                return data
            } catch (error) {
                return error
            }
        },
        async addSolution(_, args){
            try {
                const { data } = await axios.post(userQuestionUrl, args)
                redis.del("solutions")
                return data
            } catch (error) {
                return error
            }
        },
        async deleteQuestion(_, args){
            try {
                const { data } = await axios.delete(`${userQuestionUrl}/${args.question_id}`)
                redis.del("questions")
                return data
            } catch (error) {
                return error
            }
        },
        async deleteSampleSolution(_, args){
            try {
                const { data } = await axios.delete(`${userQuestionUrl}/${args.question_id}/${args.solution_id}`)
                redis.del("sampleSolutions")
                return data
            } catch (error) {
                return error
            }
        },
        async deleteSolution(_, args){
            try {
                const { data } = await axios.delete(`${userQuestionUrl}/${args.question_id}/${args.solution_id}`)
                redis.del("solutions")
                return data
            } catch (error) {
                return error
            }
        },
        async updateQuestion(_, args){
            try {
                const { timeLimit, title, score, description, question_id } = args
                const payload = {
                    timeLimit, title, score, description
                }
                const { data } = await axios.put(`${userQuestionUrl}/${question_id}`, payload)
                redis.del("questions")
                return data
            } catch (error) {
                return error
            }
        },
        async updateSampleSolution(_, args){
            try {
                const { input, output, question_id, solution_id } = args
                const payload = {
                    input, output
                }
                const { data } = await axios.put(`${userQuestionUrl}/${question_id}/${solution_id}`, payload)
                redis.del("sampleSolutions")
                return data
            } catch (error) {
                return error
            }
        },
        async updateSolution(_, args){
            try {
                const { input, output, question_id, solution_id } = args
                const payload = {
                    input, output
                }
                const { data } = await axios.put(`${userQuestionUrl}/${question_id}/${solution_id}`, payload)
                redis.del("solutions")
                return data
            } catch (error) {
                return error
            }
        },
        postCode: (parent, { user, content }) => {
            const id = codes.length;
            codes.push({
                id,
                user,
                content
            });
            code = {
                id,
                user,
                content
            }
            subscribers.forEach((fn) => fn())
            return id
        }
    },
    Subscription: {
        code: {
            subscribe: (parent, args, { pubsub }) => {
                const channel = Math.random().toString(36).slice(2, 15);
                onCodeUpdates(() => pubsub.publish(channel, { code }));
                setTimeout(() => pubsub.publish(channel, { code }), 0)
                return pubsub.asyncIterator(channel);
            }
        }
    }
}

module.exports = { typeDefs, resolvers }
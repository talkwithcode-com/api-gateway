const Redis = require("ioredis");
const redis = new Redis();
const axios = require('axios')
const userQuestionUrl = "http://localhost:5001"
const codexUrl = "http://localhost:5002"

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
        }
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
        }
    }
}

module.exports = resolvers
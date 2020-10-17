const { gql } = require('apollo-server')

const typeDefs = gql`
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

    type Query {
        questions: [Question]
        sample_solutions: [SampleSolution]
        solutions: [Solution]
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
    }
`

module.exports = typeDefs
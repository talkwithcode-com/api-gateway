const Query = {
    questions: async (parent, args, { questionUserService, redis }) => {
        const questionsCache = await redis.get("questions")
        try {
            if(questionsCache !== null){
                return JSON.parse(questionsCache)
            } else {
                const { data } = await questionUserService.get("/")
                await redis.set("questions", JSON.stringify(data.questions))
                return data.questions
            }
        } catch (error) {
            return error
        }
    },
    sample_solutions: async (parent, args, { questionUserService, redis }) => {
        const sampleSolutionsCache = await redis.get("sampleSolutions")
        try {
            if(sampleSolutionsCache !== null){
                return JSON.parse(sampleSolutionsCache)
            } else {
                const { data } = await questionUserService.get("/")
                await redis.set("sampleSolutions", JSON.stringify(data.solution))
                return data.solution
            }
        } catch (error) {
            return error
        }
    },
    solutions: async (parent, args, { questionUserService, redis }) => {
        const solutionsCache = await redis.get("solutions")
        try {
            if(solutionsCache !== null){
                return JSON.parse(solutionsCache)
            } else {
                const { data } = await questionUserService.get("/")
                await redis.set("solutions", JSON.stringify(data.solution))
                return data.solution
            }
        } catch (error) {
            return error
        }
    },
    code: async (parent, args, { redis }) => {
        const codeCache = await redis.get("code")
        console.log(codeCache, "<<< masuk query codeCache")
        try {
            if(codeCache !== null){
                return JSON.parse(codeCache)
            } else {
                return {}
            }
        } catch (error) {
            return error
        }
    },
}
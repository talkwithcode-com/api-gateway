const Query = {
  questions: async (parent, args, { questionUserService, redis }) => {
    const questionsCache = await redis.get("questions");
    try {
      if (questionsCache !== null) {
        return JSON.parse(questionsCache);
      } else {
        const response = await questionUserService.get("/questions", {
          headers: { ...args },
        });
        const { data } = response;
        await redis.set("questions", JSON.stringify(data.questions));
        return data.questions;
      }
    } catch (error) {
      return error;
    }
  },
  question: async (parent, args, { questionUserService, redis }) => {
    const solutionCache = await redis.get("question");
    try {
      if (solutionCache !== null && false) {
        return JSON.parse(solutionCache);
      } else {
        const response = await questionUserService.get(
          "/questions/" + args._id + "/solution",
          {
            headers: {
              access_token: args.access_token,
            },
          }
        );
        const { data } = response;
        console.log(data.questions[0], "<<< ini data questions");
        await redis.set("question", JSON.stringify(data.questions[0]));
        return data.questions[0];
      }
    } catch (error) {
      return error;
    }
  },
  code: async (parent, args, { redis }) => {
    const codeCache = await redis.get("code");
    try {
      if (codeCache !== null) {
        return JSON.parse(codeCache);
      } else {
        return {};
      }
    } catch (error) {
      return error;
    }
  },
};

module.exports = { Query };

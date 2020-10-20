const { generateToken, verifyToken } = require("../helpers/jwt");

let code = {};
const codes = [];
const subscribers = [];
const onCodeUpdates = (fn) => subscribers.push(fn);

const Mutation = {
  async addQuestion(_, args, { questionUserService, redis }) {
    try {
      const { data } = await questionUserService.post("/", { ...args.data });
      redis.del("questions");
      return data;
    } catch (error) {
      return error;
    }
  },
  async addSampleSolution(_, args, { questionUserService, redis }) {
    try {
      const { data } = await questionUserService.post("/", { ...args.data });
      redis.del("sampleSolutions");
      return data;
    } catch (error) {
      return error;
    }
  },
  async addSolution(_, args, { questionUserService, redis }) {
    try {
      const { data } = await questionUserService.post("/", { ...args.data });
      redis.del("solutions");
      return data;
    } catch (error) {
      return error;
    }
  },
  async deleteQuestion(_, args, { questionUserService, redis }) {
    try {
      const { data } = await questionUserService.delete(`/${args.question_id}`);
      redis.del("questions");
      return data;
    } catch (error) {
      return error;
    }
  },
  async deleteSampleSolution(_, args, { questionUserService, redis }) {
    try {
      const { data } = await questionUserService.delete(
        `/${args.question_id}/${args.solution_id}`
      );
      redis.del("sampleSolutions");
      return data;
    } catch (error) {
      return error;
    }
  },
  async deleteSolution(_, args, { questionUserService, redis }) {
    try {
      const { data } = await questionUserService.delete(
        `/${args.question_id}/${args.solution_id}`
      );
      redis.del("solutions");
      return data;
    } catch (error) {
      return error;
    }
  },
  async updateQuestion(_, args, { questionUserService, redis }) {
    try {
      const { timeLimit, title, score, description, question_id } = args;
      const payload = {
        timeLimit,
        title,
        score,
        description,
      };
      const { data } = await questionUserService.put(
        `/${question_id}`,
        payload
      );
      redis.del("questions");
      return data;
    } catch (error) {
      return error;
    }
  },
  async updateSampleSolution(_, args, { questionUserService, redis }) {
    try {
      const { input, output, question_id, solution_id } = args;
      const payload = {
        input,
        output,
      };
      const { data } = await questionUserService.put(
        `/${question_id}/${solution_id}`,
        payload
      );
      redis.del("sampleSolutions");
      return data;
    } catch (error) {
      return error;
    }
  },
  async updateSolution(_, args, { questionUserService, redis }) {
    try {
      const { input, output, question_id, solution_id } = args;
      const payload = {
        input,
        output,
      };
      const { data } = await questionUserService.put(
        `/${question_id}/${solution_id}`,
        payload
      );
      redis.del("solutions");
      return data;
    } catch (error) {
      return error;
    }
  },
  postCode: async (parent, { user, content }, { redis }) => {
    const id = codes.length;
    code = {
      _id: id,
      user,
      content,
    };
    redis.set("code", JSON.stringify(code));

    subscribers.forEach((fn) => fn());
    return id;
  },
  addChannelToken: async (
    _,
    { time_start, time_end, user_id, ids },
    { redis }
  ) => {
    try {
      let payload = {
        time_start,
        time_end,
        user_id,
        ids,
      };
      const token = generateToken(payload);
      const now = new Date();
      const key = now.getTime().toString();
      const end = new Date(time_end);
      const exp = Math.round(Number((end - now) / 1000));
      await redis.set(key, token, "ex", exp);
      console.log(key, "<<< ini key");
      return key;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  validateChannelToken: async (_, { key }, { questionUserService, redis }) => {
    try {
      let token = await redis.get(key);
      if (token) {
        const decodeToken = verifyToken(token);
        const { time_start, time_end, user_id, ids } = decodeToken;

        //query ke question service by ids
        const idsArr = ids.trim().split(",");

        // let questions = [];
        let questions = await idsArr.map(async (id) => {
          const resp = await questionUserService.get(
            `/questions/${id}/solution`
          );
          const { data } = await resp;
          console.log(data, "<<< data id di mapping");
          // questions.push(data);
          return JSON.stringify(data);
        });

        let Decode = {
          time_start,
          time_end,
          user_id,
          questions,
        };

        return Decode;
      }
    } catch (error) {
      return error;
    }
  },
};

const Subscription = {
  code: {
    subscribe: (parent, args, { pubsub }) => {
      const channel = Math.random().toString(36).slice(2, 15);
      onCodeUpdates(() => pubsub.publish(channel, { code }));
      setTimeout(() => pubsub.publish(channel, { code }), 0);
      return pubsub.asyncIterator(channel);
    },
  },
};

module.exports = { Mutation, Subscription };

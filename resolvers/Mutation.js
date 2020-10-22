const { generateToken, verifyToken } = require("../helpers/jwt");

let code = {};
const codes = [];
const subscribers = [];
const onCodeUpdates = (fn) => subscribers.push(fn);

const Mutation = {
  // done
  async addQuestion(_, args, { questionUserService, redis }) {
    try {
      const response = await questionUserService.post(
        "/questions",
        {
          ...args,
        },
        {
          headers: {
            access_token: args.access_token,
          },
        }
      );
      const { data } = response;
      redis.del("questions");
      return data;
    } catch (error) {
      return error;
    }
  },
  // done
  async addSampleSolution(_, args, { questionUserService, redis }) {
    try {
      const response = await questionUserService.put(
        "/question/" + args.question_id + "/add-sample-solution",
        { ...args },
        {
          headers: {
            access_token: args.access_token,
          },
        }
      );
      const { data } = response;
      redis.del("questions");
      return data;
    } catch (error) {
      return error;
    }
  },
  // done
  async addSolution(_, args, { questionUserService, redis }) {
    try {
      const response = await questionUserService.put(
        "/question/" + args.question_id + "/add-solution",
        {
          ...args,
        },
        {
          headers: {
            access_token: args.access_token,
          },
        }
      );
      const { data } = response;
      redis.del("questions");
      return data;
    } catch (error) {
      return error;
    }
  },
  //done
  async deleteQuestion(_, args, { questionUserService, redis }) {
    try {
      const response = await questionUserService.delete(
        "/questions/" + args.question_id,
        {
          headers: {
            access_token: args.access_token,
          },
        }
      );
      const { data } = response;
      redis.del("questions");
      return "question deleted";
    } catch (error) {
      return error;
    }
  },
  async deleteSolution(_, args, { questionUserService, redis }) {
    try {
      const response = await questionUserService.delete(
        "/questions/" + args.question_id + "/" + args.solution_id,
        {
          headers: {
            access_token: args.access_token,
          },
        }
      );
      const { data } = response;
      redis.del("questions");
      return "Solution deleted";
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
  // done
  addChannelToken: async (
    _,
    { title, time_start, time_end, user_id, ids },
    { redis }
  ) => {
    try {
      let payload = {
        title,
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
  // outstanding - get questions to services
  validateChannelToken: async (
    _,
    { key, access_token },
    { questionUserService, redis }
  ) => {
    try {
      let token = await redis.get(key);
      if (token) {
        const decodeToken = verifyToken(token);
        const { time_start, time_end, user_id, ids } = decodeToken;

        //query ke question service by ids
        const idsArr = ids.trim().split(",");

        let questions = await idsArr.map(async (id) => {
          const resp = await questionUserService.get(
            "/questions/" + id + "/solution",
            {
              headers: {
                access_token,
              },
            }
          );
          console.log(id, "<<< id");
          const { data } = resp;
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
  // done
  register: async (_, args, { questionUserService }) => {
    try {
      const response = await questionUserService.post("/users/register", {
        ...args,
      });
      const { data } = response;
      return JSON.stringify(data);
    } catch (error) {
      return error;
    }
  },
  // done
  login: async (_, args, { questionUserService }) => {
    try {
      const response = await questionUserService.post("/users/login", {
        ...args,
      });
      console.log(response, "<<< response");
      const { data } = response;
      return JSON.stringify(data);
    } catch (error) {
      return error;
    }
  },
  runCode: async (_, args, { codexService, questionUserService, redis }) => {
    try {
      // dapet sample test case
      const { access_token, data: dataInput } = args;
      const { question_id, lang, source_code } = dataInput;
      console.log(args, "<<< args ini test case");

      const resp = await questionUserService.get(
        "/questions/" + question_id + "/solution",
        {
          headers: {
            access_token,
          },
        }
      );
      const {
        data: { questions },
      } = resp;

      const test_cases = questions[0].sample_solution.map((e) => {
        return {
          id: e.id,
          input: e.input,
          output: e.output,
        };
      });

      // kirim ke codex
      const response = await codexService.post("/run", {
        source_code,
        language: lang,
        test_cases,
      });
      const { data } = response;
      return data;
    } catch (error) {
      return error.response;
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

import PromptAPI from "promptapi";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const OpenAICompletion = async (systemPrompt: string, prompt: string) => {
  const res = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 500,
    n: 1,
  });

  return res.data.choices[0].message;
};

export async function POST(request: Request) {
  const { spec, input } = await request.json();
  const promptApi = PromptAPI.fromSpec(spec);
  const compile = promptApi.compile(input);
  const completion = await OpenAICompletion(compile, "");
  const raw = completion?.content!;
  const parsed = promptApi.parse(raw);
  return new Response(
    JSON.stringify({
      raw: completion?.content,
      ouput: parsed,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

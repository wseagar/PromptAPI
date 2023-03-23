import { test, expect, describe } from "@jest/globals";

import op, { PromptAPISpec } from "./main";

const inputSchema = {
  name: {
    type: "string",
    description: "Name",
  },
} as const;

const outputSchema = {
  result: {
    type: "string",
    description: "The response from the LLM",
  },
} as const;

const BASIC_SPECIFICATION: PromptAPISpec<
  typeof inputSchema,
  typeof outputSchema
> = {
  name: "open-prompt",
  description: "Open Prompt",
  author: "Open Prompt",
  version: "0.0.1",
  license: "MIT",
  homepage: "https://open-prompt.com",
  repository: {
    type: "git",
    url: "htt",
  },
  template: {
    language: "liquid",
    content: "Hello {{ input.name }}\n",
  },
  input: {
    schema: inputSchema,
  },
  output: {
    schema: outputSchema,
  },
  examples: [
    {
      input: {
        name: "Open Prompt",
      },
      output: {
        result: "Hello, this is Open Prompt speaking to you",
      },
    },
  ],
};

describe("Basic tests", () => {
  test("It should create a specification", () => {
    const basicSpec = op.fromSpec(BASIC_SPECIFICATION);
    expect(basicSpec).toBeDefined();
  });
  test("It should compile", () => {
    const basicSpec = op.fromSpec(BASIC_SPECIFICATION);
    const compiled = basicSpec.compile({
      name: "ChatGPT",
    });
    expect(compiled).toBeDefined();
    expect(compiled).toBe("Hello ChatGPT\n");
  });
});

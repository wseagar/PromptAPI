import { test, expect } from "@jest/globals";

import op from "./node";
import fs from "fs";

const regexSpec = op.fromFolder("../spec/regex");

const output = `You are a developer that is tasked with writing a regular expression that matches the given input strings.

examples: foo , bar , baz
output:
<schema>
  <regex type="string" description="A regular expression that matches the input strings.">
    ^(foo|bar|baz)$
  </regex>
</schema>

description: A regex that matches emails
examples: w.seagar@gmail.com
output:
<schema>
  <regex type="string" description="A regular expression that matches the input strings.">
    ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$
  </regex>
</schema>

description: A regex that matches phone numbers
examples: 486-7721 , 412-7722 , 09-442-7723
output:`;

test("regex", () => {
  const compiled = regexSpec.compile({
    strings_to_match: ["486-7721", "412-7722", "09-442-7723"],
    regex_description: "A regex that matches phone numbers",
  });

  fs.writeFileSync("regex.txt", compiled);

  expect(compiled).toBe(output);
});

test("regex parse", () => {
  const result = `<schema>
    <regex type="string" description="A regular expression that matches the input strings.">
      ^\d{2,3}-\d{3}-\d{4}$
    </regex>
  </schema>`;

  const parsed = regexSpec.parse(result);

  expect(parsed).toEqual({
    regex: "^d{2,3}-d{3}-d{4}$",
  });
});

test("sentiment", () => {
  const sentimentSpec = op.fromFolder("../spec/sentiment");

  const compiled = sentimentSpec.compile({
    input_text:
      "The food at this restaurant was honestly terrible. The dishes were cold, the flavors were bland, and the service was painfully slow. I can't believe I wasted my money here.",
  });

  fs.writeFileSync("regex.txt", compiled);

  expect(compiled).toBe("negative");
});

test("sentiment compile", () => {
  const example = {
    sentiment: 10,
    reason:
      "These words and phrases convey a sense of satisfaction and appreciation for the customer service at the store, indicating a positive sentiment towards the experience.",
    words: [
      "absolutely fantastic",
      "warm smile",
      "helpful staff",
      "go above and beyond",
    ],
  };

  const schema = {
    sentiment: {
      type: "number",
      description:
        "A integer number between 0-10, where 0 is negative and 10 is positive.",
    },
    reason: {
      type: "string",
      description: "The reason for the sentiment.",
    },
    words_or_phrases: {
      type: "array",
      description:
        "The words or phrases that were used to determine the sentiment.",
      items: {
        type: "string",
      },
    },
  };
});

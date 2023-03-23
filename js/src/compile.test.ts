import { test, expect } from "@jest/globals";

import op from "./node";
import fs from "fs";

const regexSpec = op.fromFolder("../spec/regex");
const regexOutput = `You are a developer that is tasked with writing a regular expression that matches the given input strings.

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

test("regex_compile", () => {
  const compiled = regexSpec.compile({
    strings_to_match: ["486-7721", "412-7722", "09-442-7723"],
    regex_description: "A regex that matches phone numbers",
  });

  expect(compiled).toBe(regexOutput);
});

const sentimentSpec = op.fromFolder("../spec/sentiment");
const sentiment_output = `Please analyze the sentiment expressed in the following text and rank it on a integer scale between 0-10. Explain your reasoning based on the words and phrases used in the text.
The following example shows how you must format your response.

Text to analyze: 'The customer service at this store is absolutely fantastic. Every time I visit, I'm greeted with a warm smile and helpful staff who go above and beyond to make sure I find what I need.'
Sentiment analysis:
<schema>
  <sentiment type="number" description="A integer number between 0-10, where 0 is negative and 10 is positive.">
    10
  </sentiment>
  <reason type="string" description="The reason for the sentiment.">
    These words and phrases convey a sense of satisfaction and appreciation for the customer service at the store, indicating a positive sentiment towards the experience.
  </reason>
  <words_or_phrases type="array" description="The words or phrases that were used to determine the sentiment.">
    <item type="string">
      absolutely fantastic
    </item>
    <item type="string">
      warm smile
    </item>
    <item type="string">
      helpful staff
    </item>
    <item type="string">
      go above and beyond
    </item>
  </words_or_phrases>
</schema>


Text to analyze: 'The food at this restaurant was honestly terrible. The dishes were cold, the flavors were bland, and the service was painfully slow. I can't believe I wasted my money here.'
Sentiment analysis:`;

test("sentiment_compile", () => {
  const compiled = sentimentSpec.compile({
    input_text:
      "The food at this restaurant was honestly terrible. The dishes were cold, the flavors were bland, and the service was painfully slow. I can't believe I wasted my money here.",
  });

  expect(compiled).toBe(sentiment_output);
});

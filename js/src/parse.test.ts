import { test, expect } from "@jest/globals";
import op from "./node";

const regexSpec = op.fromFolder("../spec/regex");
const regex_output = `<schema>
<regex type="string" description="A regular expression that matches the input strings.">
  ^\d{2,3}-\d{3}-\d{4}$
</regex>
</schema>`;
test("regex_parse", () => {
  const parsed = regexSpec.parse(regex_output);

  expect(parsed).toEqual({
    regex: "^d{2,3}-d{3}-d{4}$",
  });
});

const sentimentSpec = op.fromFolder("../spec/sentiment");
const sentiment_output = `<schema>
<sentiment type="number" description="An integer number between 0-10, where 0 is negative and 10 is positive.">
  1
</sentiment>
<reason type="string" description="The reason for the sentiment.">
  The words and phrases used in this text express dissatisfaction and disappointment with the restaurant experience, indicating a highly negative sentiment towards it.
</reason>
<words_or_phrases type="array" description="The words or phrases that were used to determine the sentiment.">
  <item type="string">
    terrible
  </item>
  <item type="string">
    cold
  </item>
  <item type="string">
    bland
  </item>
  <item type="string">
    painfully slow
  </item>
  <item type="string">
    wasted my money
  </item>
</words_or_phrases>
</schema>`;

test("sentiment_parse", () => {
  const parsed = sentimentSpec.parse(sentiment_output);

  expect(parsed).toEqual({
    sentiment: 1,
    reason:
      "The words and phrases used in this text express dissatisfaction and disappointment with the restaurant experience, indicating a highly negative sentiment towards it.",
    words_or_phrases: [
      "terrible",
      "cold",
      "bland",
      "painfully slow",
      "wasted my money",
    ],
  });
});

# OpenPrompt &emsp; [![latest version badge]][npm] [![license badge]][license] [![downloads badge]][npm]

[latest version badge]: https://img.shields.io/npm/v/@vaxxnz/nzcp
[license badge]: https://img.shields.io/npm/l/@vaxxnz/nzcp
[downloads badge]: https://img.shields.io/npm/dw/@vaxxnz/nzcp
[npm]: https://www.npmjs.com/package/@vaxxnz/nzcp
[license]: https://github.com/vaxxnz/nzcp-js/blob/main/LICENSE

OpenPrompt is an open-source, language-agnostic JSON-based schema format for defining and working with large language model (LLM) prompts. It features a Typescript implementation in its repository, but the format is designed to be adaptable across various programming languages. OpenPrompt addresses challenges in working with large language models by improving output parsing/validation, enabling prompt sharing/versioning, and minimizing code complexity.

## Install

```bash
# NPM
npm i OpenPrompt

# Yarn
yarn add OpenPrompt

# pnpm
pnpm i OpenPrompt
```

## Usage

OpenPrompt utilizes Shopify's Liquid templating language to build prompts, integrating helper functions that guide the LLM to generate responses in a parsable HTML/XML-like format. The decision to adopt an HTML-like format is intentional, given that LLMs have extensive training on HTML/XML content and are highly proficient in creating such structures. Additionally, HTML parsers can efficiently manage slightly malformed or damaged HTML.

The core of the OpenPrompt implementation is:

 - `const spec = OpenPrompt.fromSpec(spec, template) / OpenPrompt.fromFolder(folder)`: Loads a specification and a template
 - `const prompt = spec.compile(inputs)`: This function compiles the provided inputs into a prompt according to the OpenPrompt specification.
 - `const output = spec.parse(llmTextResponse)`: This function parses the LLM text response into an object.

OpenPrompt does not handle interacting with any specific LLM/LLM API and is out of scope.

### Tutorial

The following is an example of using OpenPrompt and the OpenPrompt typescript library to create a reliable NLP sentiment extractor.

Firstly we need to create `sentiment.json` and `sentiment.liquid`

sentiment.liquid

```
Please analyze the sentiment expressed in the following text and rank it on a integer scale between 0-10. Explain your reasoning based on the words and phrases used in the text.
The following example shows how you must format your response.

{% for example in examples %}
  Text to analyze: '{{ example.input.input_text }}'
  Sentiment analysis:
  {{ example.output | asSchema }}

{% endfor %}

Text to analyze: '{{ input.input_text }}'
Sentiment analysis:
```

sentiment.json

```
{
  "name": "sentiment-extractor",
  "description": "Extract the sentiment of the text.",
  "author": "w.seagar@gmail.com",
  "version": "0.1.0",
  "license": "MIT",
  "template": {
    "language": "liquid",
    "file": "sentiment.liquid"
  },
  "input": {
    "schema": {
      "input_text": {
        "type": "string"
      }
    }
  },
  "output": {
    "schema": {
      "sentiment": {
        "type": "number",
        "description": "A integer number between 0-10, where 0 is negative and 10 is positive."
      },
      "reason": {
        "type": "string",
        "description": "The reason for the sentiment."
      },
      "words_or_phrases": {
        "type": "array",
        "description": "The words or phrases that were used to determine the sentiment.",
        "items": {
          "type": "string"
        }
      }
    }
  },
  "examples": [
    {
      "input": {
        "input_text": "The customer service at this store is absolutely fantastic. Every time I visit, I'm greeted with a warm smile and helpful staff who go above and beyond to make sure I find what I need."
      },
      "output": {
        "sentiment": 10,
        "reason": "These words and phrases convey a sense of satisfaction and appreciation for the customer service at the store, indicating a positive sentiment towards the experience.",
        "words_or_phrases": [
          "absolutely fantastic",
          "warm smile",
          "helpful staff",
          "go above and beyond"
        ]
      }
    }
  ]
}
```

Now in NodeJS

```
import OpenPrompt from "openprompt";

const spec = OpenPrompt.fromFolder("./sentiment");
const prompt = spec.compile({
  input_text: "The food at this restaurant was honestly terrible. The dishes were cold, the flavors were bland, and the service was painfully slow. I can't believe I wasted my money here."
});
console.log(prompt);
```

```
Please analyze the sentiment expressed in the following text and rank it on a integer scale between 0-10. Explain your reasoning based on the words and phrases used in the text.
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
Sentiment analysis:
```

Now use your favourite method to send this prompt to a LLM. In this example I will use ChatGPT 3.5 turbo.

LLM response

```
<schema>
  <sentiment type="number" description="An integer number between 0-10, where 0 is negative and 10 is positive.">
    1
  </sentiment>
  <reason type="string" description="The reason for the sentiment.">
    The words and phrases used in the text indicate a highly negative sentiment towards the experience, with the customer expressing dissatisfaction with multiple aspects of their visit to the restaurant.
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
</schema>
```

```
const parsed = spec.parse(llmResponseText);
console.log(parsed.sentiment); // 1
console.log(parsed.reason); // "The words and phrases used in the text indicate a highly negative sentiment towards the experience, with the customer expressing dissatisfaction with multiple aspects of their visit to the restaurant."
console.log(parsed.words_or_phrases) // ["terrible", "cold", "bland", "painfully slow", "wasted my money"]
```

### Why did I make this?

OpenPrompt was created to address several challenges associated with working with large language models (LLMs):

- **Improve output validation/parsing**: LLMs can generate outputs that are difficult to parse. OpenPrompt facilitates more structured and easily parsable outputs.

- **Prompt sharing and tooling**: Sharing complex prompts (that take input/output) is currently not possible without sharing code.

- **Prompt versioning**: Managing different versions of prompts can be complex. OpenPrompt simplifies this process by providing a consistent schema format that can be updated and versioned.

- **Minimize code complexity**: Building and parsing prompt outputs often require substantial amounts of code. OpenPrompt reduces this complexity by offering a structured approach to prompt creation and parsing.

### Schema Format

OpenPrompt uses a JSON-based schema format to define the input and output structure of a prompt. The schema includes metadata such as the prompt's name, description, author, version, and license. It also specifies the input and output schemas, as well as the template used to generate the prompt.

Refer to the example schema provided earlier to understand the schema structure.

### Template Language

OpenPrompt uses the [Liquid][https://shopify.github.io/liquid/] template language to create the prompt text from the input data. You can define your own template file and include it in your schema.

### Contributing

We welcome contributions to improve OpenPrompt. Feel free to submit issues and pull requests to contribute to the project.

License
MIT

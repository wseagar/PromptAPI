import { Liquid } from "liquidjs";
import { Cheerio, load, Element } from "cheerio";
import { CheerioAPI } from "cheerio/lib/load";

type Schema = {
  [key: string]: SchemaEntry;
};

type SchemaEntry = ArraySchemaEntry | ObjectSchemaEntry | BasicSchemaEntry;

interface BasicSchemaEntry {
  type: "string" | "number" | "boolean";
  description?: string;
}

interface ArraySchemaEntry {
  type: "array";
  description?: string;
  items: SchemaEntry;
}

interface ObjectSchemaEntry {
  type: "object";
  description?: string;
  properties: Schema;
}

type Value<T extends SchemaEntry> = T extends ArraySchemaEntry
  ? Array<Value<T["items"]>>
  : T extends ObjectSchemaEntry
  ? { [K in keyof T["properties"]]: Value<T["properties"][K]> }
  : T["type"] extends "string"
  ? string
  : T["type"] extends "number"
  ? number
  : T["type"] extends "boolean"
  ? boolean
  : any;

type Values<S extends Schema> = {
  [key in keyof S]: Value<S[key]>;
};

export interface OpenPromptSpec<
  InputSchema extends Schema = Schema,
  OutputSchema extends Schema = Schema
> {
  name: string;
  description?: string;
  author?: string;
  version?: string;
  license?: string;
  homepage?: string;
  repository?: {
    type?: string;
    url?: string;
  };
  template: {
    language: "liquid";
    file?: string;
    content?: string;
  };
  input: {
    schema: InputSchema;
  };
  output: {
    schema: OutputSchema;
  };
  examples: {
    input: Values<InputSchema>;
    output: Values<OutputSchema>;
  }[];
}

type SchemaWithValue = {
  [key: string]: SchemaEntryWithValue;
};

type SchemaEntryWithValue = SchemaEntry & { value?: any };

function schemaEntryToXML(
  key: string,
  schemaEntry: SchemaEntryWithValue,
  depth: number = 0
): string {
  const indent = "  ".repeat(depth);
  const type = schemaEntry.type;
  const description = schemaEntry.description;
  const value = schemaEntry.value;
  let xml = `${indent}<${key} type="${type}"`;
  if (description) {
    xml += ` description="${description}"`;
  }

  if (type === "object") {
    xml += ">\n";
    const objectSchemaEntry = schemaEntry as ObjectSchemaEntry;
    for (const [propKey, propValue] of Object.entries(
      objectSchemaEntry.properties
    )) {
      xml += schemaEntryToXML(propKey, propValue, depth + 1);
    }
  } else if (type === "array") {
    xml += ">\n";
    for (const itemValue of value || []) {
      xml += schemaEntryToXML("item", itemValue, depth + 1);
    }
  } else {
    if (value !== undefined) {
      xml += `>\n${indent}  ${value}\n`;
    } else {
      xml += ">\n";
    }
  }

  xml += `${indent}</${key}>\n`;
  return xml;
}

function schemaToXML(schema: SchemaWithValue): string {
  let xml = "<schema>\n";
  for (const [key, value] of Object.entries(schema)) {
    xml += schemaEntryToXML(key, value, 1);
  }
  xml += "</schema>";
  return xml;
}

function combineSchemaAndValues<S extends Schema>(
  schema: S,
  values: Values<S>
): any {
  const schemaWithValue: any = {};

  for (const key in schema) {
    const schemaEntry = schema[key];
    const value = values[key];

    if (schemaEntry.type === "object") {
      schemaWithValue[key] = {
        ...schemaEntry,
        properties: combineSchemaAndValues(
          (schemaEntry as any).properties,
          value
        ),
      };
    } else if (schemaEntry.type === "array") {
      const itemsWithValues = value.map((itemValue: any) => ({
        ...(schemaEntry as any).items,
        value: itemValue,
      }));
      schemaWithValue[key] = {
        ...schemaEntry,
        value: itemsWithValues,
      };
    } else {
      schemaWithValue[key] = {
        ...schemaEntry,
        value,
      };
    }
  }

  return schemaWithValue;
}

function schemaToXMLWithValues<S extends Schema = Schema>(
  schema: S,
  values: Values<S>
): string {
  const schemaWithValue = combineSchemaAndValues(schema, values);
  return schemaToXML(schemaWithValue);
}

function parseElement(element: Element, schemaEntry: SchemaEntry): any {
  if (schemaEntry.type === "object") {
    const objectSchemaEntry = schemaEntry as ObjectSchemaEntry;
    const values: any = {};

    element.children.forEach((child) => {
      if (child.type !== "tag") return;
      const key = child.tagName;
      const childSchemaEntry = objectSchemaEntry.properties[key];
      if (childSchemaEntry) {
        values[key] = parseElement(child, childSchemaEntry);
      }
    });

    return values;
  } else if (schemaEntry.type === "array") {
    const arraySchemaEntry = schemaEntry as ArraySchemaEntry;
    const values: any[] = [];

    element.children.forEach((child) => {
      if (child.type !== "tag") return;
      if (child.tagName === "item") {
        values.push(parseElement(child, arraySchemaEntry.items));
      }
    });

    return values;
  } else {
    const text = load(element).text().trim();
    return schemaEntry.type === "string"
      ? text
      : schemaEntry.type === "number"
      ? parseFloat(text)
      : schemaEntry.type === "boolean"
      ? text === "true"
      : undefined;
  }
}

function parseXMLToValues<OutputSchema extends Schema = Schema>(
  document: CheerioAPI,
  schema: OutputSchema
): Values<OutputSchema> {
  const schemaElement = document("schema").first();

  const values: any = {};

  schemaElement.children().each((_, child) => {
    const key = child.tagName;
    const schemaEntry = schema[key];
    if (schemaEntry) {
      values[key] = parseElement(child, schemaEntry);
    }
  });

  return values;
}

function fromSpec<
  InputSchema extends Schema = Schema,
  OutputSchema extends Schema = Schema
>(spec: OpenPromptSpec<InputSchema, OutputSchema>) {
  // Note: This is not required for the spec to be valid, but it must use a alternative loader function
  // to get the template content in here.
  // IE in a node environment you can use OpenPrompt.fromFolder(...) which will load the template content
  // from the file system and put it into this field.
  if (!spec.template.content) {
    throw new Error("Template content is required");
  }

  const template = spec.template.content;

  const engine = new Liquid({ trimTagRight: true, greedy: false });
  engine.registerFilter("asSchema", (v) => {
    return schemaToXMLWithValues(spec.output.schema, v);
  });

  return {
    compile: (input: Values<InputSchema>) => {
      const xml = schemaToXML(spec.output.schema);

      return engine.parseAndRenderSync(template, {
        input,
        examples: spec.examples,
      });
    },
    parse: (output: string): Values<OutputSchema> => {
      const document = load(output);
      return parseXMLToValues(document, spec.output.schema);
    },
  };
}

export default {
  fromSpec,
  fromFolder: (folder: string): ReturnType<typeof fromSpec> => {
    throw new Error(
      `Not implemented, use OpenPrompt.fromSpec(...) instead. ${folder}`
    );
  },
};

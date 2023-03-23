/**
 * This file is the entrypoint of node builds.
 * The code executes when loaded in a node.
 */
import PromptAPI, { PromptAPISpec } from "./main";
import fs from "fs";
import path from "path";

const normalizeLineEndings = (str: string) => {
  return str.replace(/\r\n|\r/g, "\n");
};

PromptAPI.fromFolder = (folder: string) => {
  const directory = fs.readdirSync(folder);
  const files = directory.filter((file) => file.endsWith(".json"));
  if (files.length !== 1) {
    throw new Error(
      `Expected exactly one JSON file in ${folder}, found ${files.length}`
    );
  }
  const specFilePath = path.join(folder, files[0]);
  const spec = JSON.parse(
    fs.readFileSync(specFilePath, "utf-8")
  ) as PromptAPISpec;

  const templateFiles = directory.filter((d) => d === spec.template.file);
  if (templateFiles.length !== 1) {
    throw new Error(
      `Expected exactly one template file in ${folder}, found ${templateFiles.length}`
    );
  }

  const templateFilePath = path.join(folder, templateFiles[0]);
  const template = fs.readFileSync(templateFilePath, "utf-8");

  const split = normalizeLineEndings(template)
    .split("\n")
    .map((l) => l.trimLeft())
    .join("\n");

  spec.template.content = split;

  return PromptAPI.fromSpec(spec);
};

export default PromptAPI;

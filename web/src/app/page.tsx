import Image from "next/image";
import { Inter } from "next/font/google";
import fs from "fs";
import PromptAPI from "promptapi";
import Inputs from "./inputs";
import Spec from "./spec";

const specFolder = fs.readdirSync("../spec");
const specFiles = specFolder.map((folders) => {
  return PromptAPI.fromFolder("../spec/" + folders);
});

export default function Home() {
  return (
    <main>
      {specFiles.map((specFile, index) => (
        <Spec key={index} spec={JSON.stringify(specFile.spec)} />
      ))}
    </main>
  );
}

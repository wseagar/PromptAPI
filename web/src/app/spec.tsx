"use client";

import PromptAPI, { PromptAPISpec, Schema } from "promptapi";
import { useEffect, useState } from "react";
import Inputs from "./inputs";

function Loading() {
  return (
    <div className="py-14 px-6 text-center text-sm sm:px-14">
      <svg
        className="animate-spin mx-auto h-5 w-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
    </div>
  );
}

export default function Spec({ spec }: { spec: string }) {
  const [inputValues, setInputValues] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);
  const [compiled, setCompiled] = useState<string>("");

  const specObj = JSON.parse(spec) as PromptAPISpec;

  const name = specObj.name;
  const description = specObj.description;
  const inputSchema = specObj.input.schema;
  const outputSchema = specObj.output.schema;
  const template = specObj.template.content;
  const examples = specObj.examples;

  const prompt = PromptAPI.fromSpec(specObj);

  function onCompile() {
    setCompiled(prompt.compile(inputValues));
  }

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);
    const response = await fetch("/api/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        spec: specObj,
        input: inputValues,
      }),
    });
    const data = await response.json();
    setResponse(data);
    setLoading(false);
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-10">
      <h2 className="text-2xl font-semibold mb-4">{name}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      <form onSubmit={submit}>
        <Inputs
          inputSchema={inputSchema}
          inputValues={inputValues}
          setInputValues={setInputValues}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 focus:outline-none"
        >
          Generate Output
        </button>
        <button
          type="button"
          className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 focus:outline-none ml-2"
          onClick={onCompile}
        >
          Compile
        </button>
      </form>
      {loading && (
        <div className="mt-8">
          <Loading />
        </div>
      )}
      {response && (
        <>
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Parsed</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(response.ouput, null, 2)}
              </pre>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Raw</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(response.raw, null, 2)}
              </pre>
            </div>
          </div>
        </>
      )}
      {compiled && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Compiled</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap">{compiled}</pre>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Examples:</h3>
        {examples.map((example, exampleIndex) => (
          <div key={exampleIndex} className="mb-4">
            <h4 className="text-lg font-semibold mb-2">
              Example {exampleIndex + 1}:
            </h4>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="mb-2">
                <strong>Input:</strong>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(example.input, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Output:</strong>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(example.output, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

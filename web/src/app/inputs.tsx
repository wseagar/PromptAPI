"use client";

import { Schema, SchemaEntry } from "promptapi";
import { useState } from "react";
import { set, cloneDeep, unset, get } from "lodash";

export default function Inputs({
  inputSchema,
  inputValues,
  setInputValues,
}: {
  inputSchema: Schema;
  inputValues: any;
  setInputValues: any;
}) {
  function handleInputChange(key: string, value: any) {
    // Clone the inputValues object to avoid modifying state directly
    const newInputValues = cloneDeep(inputValues);
    // Use lodash's set function to set the value at the given path
    set(newInputValues, key, value);
    // Update the state with the modified object
    setInputValues(newInputValues);
  }

  function handleDeleteKey(key: string) {
    // Clone the inputValues object to avoid modifying state directly
    const newInputValues = cloneDeep(inputValues);
    // Use lodash's unset function to delete the value at the given path
    unset(newInputValues, key);
    // Update the state with the modified object
    setInputValues(newInputValues);
  }

  function handleAddToArray(key: string, value: any) {
    // Clone the inputValues object to avoid modifying state directly
    const newInputValues = cloneDeep(inputValues);
    // Use lodash's get function to retrieve the array at the given path
    const targetArray = get(newInputValues, key, []);
    // Add the value to the array
    targetArray.push(value);
    // Update the object with the modified array
    set(newInputValues, key, targetArray);
    // Update the state with the modified object
    setInputValues(newInputValues);
  }

  function handleRemoveFromArray(key: string, index: number) {
    // Clone the inputValues object to avoid modifying state directly
    const newInputValues = cloneDeep(inputValues);
    // Use lodash's get function to retrieve the array at the given path
    const targetArray = get(newInputValues, key, []);
    // Remove the value at the specified index from the array
    targetArray.splice(index, 1);
    // Update the object with the modified array
    set(newInputValues, key, targetArray);
    // Update the state with the modified object
    setInputValues(newInputValues);
  }

  function renderInput(
    key: string,
    schemaEntry: SchemaEntry,
    parentKey: string | null = null
  ) {
    const { type, description } = schemaEntry;

    const k = parentKey ? `${parentKey}.${key}` : key;

    if (type === "string") {
      return (
        <input
          type="text"
          id={k}
          name={k}
          value={get(inputValues, k)}
          onChange={(e) => handleInputChange(k, e.target.value)}
          className="border-2 border-gray-300 rounded-md w-full py-2 px-4 focus:outline-none focus:border-blue-500"
        />
      );
    }
    if (type === "boolean") {
      return (
        <input
          type="checkbox"
          id={k}
          name={k}
          checked={get(inputValues, k)}
          onChange={(e) => handleInputChange(k, e.target.checked)}
          className="border-2 border-gray-300 rounded-md w-full py-2 px-4 focus:outline-none focus:border-blue-500"
        />
      );
    }

    if (type === "number") {
      return (
        <input
          type="number"
          id={k}
          name={k}
          value={get(inputValues, k)}
          onChange={(e) => handleInputChange(k, e.target.value)}
          className="border-2 border-gray-300 rounded-md w-full py-2 px-4 focus:outline-none focus:border-blue-500"
        />
      );
    }

    if (type === "array") {
      const { items } = schemaEntry;
      //   "strings_to_match": {
      //     "type": "array",
      //     "description": "A list of strings that the regular expression should match.",
      //     "items": {
      //       "type": "string",
      //       "description": "A string that the regular expression should match."
      //     }
      //   }
      const itemSchema = items;

      const array = inputValues[k] || [];

      return (
        <>
          {array.map((item: any, i: number) => (
            <div key={i} className="mb-4">
              {renderInput(i.toString(), itemSchema, k)}
              <button type="button" onClick={() => handleRemoveFromArray(k, i)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddToArray(k, "")}
            className="mt-1 text-blue-500 hover:text-blue-600 focus:outline-none"
          >
            Add another
          </button>
        </>
      );
    }

    if (type === "object") {
      const { properties } = schemaEntry;
      return (
        <>
          {Object.entries(properties).map(([key, value], i) => (
            <div key={i} className="mb-4">
              <label htmlFor={key} className="block text-gray-700 mb-1">
                {value.description}
              </label>
              {renderInput(key, value, k)}
            </div>
          ))}
        </>
      );
    }
  }

  return (
    <>
      {/* <pre>{JSON.stringify(inputValues, null, 2)}/</pre> */}
      {Object.entries(inputSchema).map(([key, value], i) => (
        <div key={i} className="mb-4">
          <label htmlFor={key} className="block text-gray-700 mb-1">
            {key} - {value.description}
          </label>
          {renderInput(key, value)}
        </div>
      ))}
    </>
  );
}

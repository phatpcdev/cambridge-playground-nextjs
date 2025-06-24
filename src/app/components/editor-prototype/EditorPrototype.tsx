"use client";

import { isEmpty, uniqueId } from "lodash";
import { useState } from "react";
import Input from "../form-control/Input";

type TContent = {
  type: "text" | "image" | "audio" | "rich_content";
  value: string[];
};

type TInteractionType = "type_answer" | "multiple_choice" | "drag";
type TInteractionConfig = Record<string, unknown>;

type TAnswer = {
  id: string;
  userAnswer: string | number | boolean;
  text?: string;
  image?: string;
  audio?: string;
  content?: TContent[];
};

type TQuestion = {
  id: string;
  title: string;
  answers: TAnswer[];
  description?: string;
  instructions?: TContent[];
  extraParams?: string;
};

type TGroupQuestionConfig = {
  questionIds: number[];
  interactionType?: TInteractionType;
  interactionConfig?: TInteractionConfig;
};

type TPart = {
  id: string;
  questions: TQuestion[];
  groupQuestionConfig: TGroupQuestionConfig[];
  interactionType?: TInteractionType;
  interactionConfig?: TInteractionConfig;
  name?: string;
  instructions?: TContent[];
  extraParams?: string;
};

const EditorPrototype = () => {
  const [isLoading] = useState(false);

  const [parts, setParts] = useState<TPart[]>([]);

  const onFormSubmit = () => {};

  return (
    <form className="flex h-screen w-screen flex-col gap-10 overflow-x-hidden px-8 pb-32 pt-8">
      <h1 className="text-center text-2xl font-semibold capitalize">
        Question scheme prototype
      </h1>

      <div className="flex flex-nowrap gap-8">
        <div className="flex flex-shrink-0 basis-1/2 flex-col gap-6 rounded-md border border-solid border-gray-400 p-3">
          <div className="flex flex-col gap-2">
            <label>Part config</label>

            <div className="flex flex-col gap-5">
              {parts.map(({ id, instructions, questions }) => {
                return (
                  <div
                    key={id}
                    className="flex flex-col gap-4 border border-gray-200 rounded-md p-3"
                  >
                    <label className="flex gap-3">
                      <span className="basis-1/6">name:</span>
                      <Input
                        className="basis-5/6"
                        type="text"
                        onChange={(event) => {
                          setParts((prev) => {
                            const newPart = [...prev];

                            const currentPartIndex = newPart.findIndex(
                              (part) => part.id === id
                            );
                            if (currentPartIndex >= 0) {
                              newPart[currentPartIndex].name =
                                event.target.value;
                            }

                            return newPart;
                          });
                        }}
                      />
                    </label>

                    <label className="flex gap-3">
                      <span className="basis-1/6">instructions:</span>

                      <div className="basis-5/6 flex flex-col gap-5">
                        <div>
                          {instructions?.map(({ type }, index) => {
                            return (
                              <div key={`${id}_instruction_${index}`}>
                                {type}
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => {}}>
                            ➕ text
                          </button>

                          <button type="button" onClick={() => {}}>
                            ➕ image
                          </button>

                          <button type="button" onClick={() => {}}>
                            ➕ audio
                          </button>

                          <button type="button" onClick={() => {}}>
                            ➕ rich text editor
                          </button>
                        </div>
                      </div>
                    </label>

                    <label className="flex gap-3">
                      <span className="basis-1/6">questions:</span>

                      <div className="basis-5/6 flex flex-col gap-5">
                        <div>
                          {questions?.map(({ id }, index) => {
                            return (
                              <div key={`${id}_question_${index}`}>{id}</div>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => {}}>
                            ➕ add
                          </button>
                        </div>
                      </div>
                    </label>

                    <label className="flex gap-3">
                      <span className="basis-1/6">interaction type:</span>

                      <div className="basis-5/6 flex items-center gap-3">
                        <label>
                          <input name={`${id}_interaction_type`} type="radio" />
                          &nbsp;type answer
                        </label>
                        <label>
                          <input name={`${id}_interaction_type`} type="radio" />
                          &nbsp;multiple choice
                        </label>
                        <label>
                          <input name={`${id}_interaction_type`} type="radio" />
                          &nbsp; drag
                        </label>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 [&>button]:cursor-pointer">
              <button
                type="button"
                onClick={() => {
                  setParts((prev) => [
                    ...prev,
                    {
                      id: uniqueId(),
                      name: "New part",
                      groupQuestionConfig: [],
                      interactionType: "type_answer",
                      questions: [],
                    },
                  ]);
                }}
              >
                ➕ new part
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 bg-white">
        <div className="flex h-20 items-center justify-center shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
          <button
            type="button"
            className="rounded-md cursor-pointer bg-slate-950 text-white uppercase w-25 h-10 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-20"
            onClick={onFormSubmit}
            disabled={isLoading || isEmpty(parts)}
          >
            {isLoading ? (
              <span className="animate-spin">
                <svg
                  viewBox="0 0 1024 1024"
                  focusable="false"
                  data-icon="loading"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
                </svg>
              </span>
            ) : (
              <span>Submit</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditorPrototype;

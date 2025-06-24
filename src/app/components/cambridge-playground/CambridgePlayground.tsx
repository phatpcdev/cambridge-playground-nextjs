import { parseJson } from "@/app/utils/string.util";
import ReactJsonView from "@microlink/react-json-view";
import axios from "axios";
import {
  entries,
  includes,
  isEmpty,
  isNil,
  isString,
  keys,
  uniqueId,
} from "lodash";
import { ReactNode, useEffect, useState } from "react";
import Input from "../form-control/Input";

const CambridgePlayground = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const [model, setModel] = useState("gpt-4.1");
  const [evaluationConfig, setEvaluationConfig] = useState({
    name: "",
    instruction: "",
  });
  // const [questionFiles, setQuestionFiles] = useState<Record<string, File>>({});
  const [questions, setQuestions] = useState<
    {
      key: string;
      type: string;
      value: string;
    }[]
  >([]);
  const [answers, setAnswers] = useState<
    {
      key: string;
      type: string;
      value: string;
    }[]
  >([]);

  const [storedEvaluationConfigs, setStoredEvaluationConfigs] = useState(() => {
    const evaluationConfigs = parseJson(
      localStorage.getItem("EVALUATION_CONFIGS")
    );

    return isNil(evaluationConfigs) ? {} : evaluationConfigs;
  });

  // const [showCopiedText, setShowCopiedText] = useState(false);
  const [serverResponse, setServerResponse] =
    useState<Record<string, string>>();

  const sample: Record<
    string,
    {
      evaluationInstruction: string;
      questionContent: string;
      questionDescription: string;
      answer: string;
    }
  > = {
    sample_1: {
      evaluationInstruction: `Scoring Rubric (0-5 Stars):
⭐ = Attempted | ⭐⭐ = Basic words | ⭐⭐⭐ = Simple sentences | ⭐⭐⭐⭐ = Good details | ⭐⭐⭐⭐⭐ = Creative & clear `,
      questionContent: "My Favourite Animal",
      questionDescription: `Draw your favourite animal and write 3 sentences about it. Use:  
1. What is it?  
2. What colour is it?  
3. Why do you like it?  
(Example: 'This is a dog. It is brown. I like dogs because they play.')`,
      answer: `its a cat. it is oranje. i like becos it is soft and run fast. my cat name is spot.`,
    },
  };

  //     const markdown = useMemo(() => {
  //       return `**Role**: You are a Cambridge Assessment English examiner. Strictly follow the scoring criteria below.

  //   ### Evaluation Instructions
  //   ${evaluationConfig.instruction}

  //   ### Question to Evaluate
  //   - **Title**: ${questionContent}
  //   - **Description**: ${questionDescription}

  //   ### Student's Answer
  //   ${answer}

  //   ---

  //   ### Scoring Task
  //   1. **Scoring Criteria Validation**:
  //      - Validate the criterion input is valid or not
  //      - The length of each criterion string is not too short.

  //   2. **Score Assignment**:
  //      - Apply the Cambridge band descriptors from the Evaluation Instructions
  //      - Assign a numerical score

  //   3. **Feedback Generation**:
  //      - Highlight 1 strength and 1 weakness specific to the answer
  //      - Reference exact phrases/examples from the student's answer
  //      - Suggest 1 concrete improvement

  //   4. **Output Format**: respond with a JSON object in the following format.\n
  //   {
  //     "score": [number],
  //     "band_descriptor": "[e.g., Mover]",
  //     "strength": "[specific observation with quote]",
  //     "weakness": "[specific issue with quote]",
  //     "improvement_suggestion": "[actionable advice]"
  //   }`;
  //     }, [
  //       evaluationConfig.instruction,
  //       answer,
  //     ]);

  //   const scheme = useMemo(() => {
  //     return [
  //       {
  //         id: "part_id",
  //         name: "part_name",
  //         instructions: [
  //           {
  //             type: "text",
  //             value: "question instruction text",
  //           },
  //           {
  //             type: "image",
  //             value: "question_instruction_image_url",
  //           },
  //           {
  //             type: "audio",
  //             value: "question_instruction_audio_url",
  //           },
  //         ],
  //         contents: [
  //           {
  //             type: "text",
  //             value: "Part instruction",
  //           },
  //           {
  //             type: "image",
  //             value: "img_url",
  //           },
  //           {
  //             type: "audio",
  //             value: "audio_url",
  //           },
  //         ],
  //         groups: [
  //           {
  //             id: "group_id",
  //             questions: [
  //               {
  //                 id: "question_id",
  //                 instructions: [
  //                   {
  //                     type: "text",
  //                     value: "question instruction text",
  //                   },
  //                   {
  //                     type: "image",
  //                     value: "question_instruction_image_url",
  //                   },
  //                   {
  //                     type: "audio",
  //                     value: "question_instruction_audio_url",
  //                   },
  //                 ],
  //                 contents: [
  //                   {
  //                     type: "text",
  //                     value: "Part instruction",
  //                   },
  //                   {
  //                     type: "image",
  //                     value: "img_url",
  //                   },
  //                   {
  //                     type: "audio",
  //                     value: "audio_url",
  //                   },
  //                 ],
  //                 text: questionContent,
  //                 description: questionDescription,
  //                 answers: [
  //                   {
  //                     id: "answer_id",
  //                     configs: {
  //                       text: "",
  //                       image: "",
  //                       audio: "",
  //                       extras: "json string",
  //                     },
  //                     user_value: answer,
  //                   },
  //                 ],
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     ];
  //   }, [questionContent, questionDescription, answer]);

  const validateModalitiesSupport = (type: "text" | "image" | "audio") => {
    const result = {
      support: false,
      message: "",
    };

    switch (model) {
      case "gpt-4o-audio-preview": {
        if (includes(["text", "audio"], type)) {
          result.support = true;
        } else {
          result.message = `The ${model} model does not support ${type}`;
        }
        break;
      }
      default: {
        if (includes(["text", "image"], type)) {
          result.support = true;
        } else {
          result.message = `The ${model} model does not support ${type}`;
        }
      }
    }

    return result;
  };

  const handleAddSampleIntoFormData = (sampleId: string) => {
    const sampleInfo = sample[sampleId];

    setEvaluationConfig({
      name: sampleId,
      instruction: sampleInfo.evaluationInstruction,
    });

    setQuestions([
      {
        key: sampleId,
        type: "text",
        value: sampleInfo.questionContent,
      },
    ]);

    setAnswers([
      {
        key: sampleId,
        type: "text",
        value: sampleInfo.answer,
      },
    ]);
  };

  const onFormSubmit = async () => {
    setServerResponse(undefined);
    setError(undefined);
    setIsLoading(true);

    const evaluationConfigsJson = parseJson(
      localStorage.getItem("EVALUATION_CONFIGS")
    );

    const newEvaluationConfigsJson = {
      ...evaluationConfigsJson,
      [evaluationConfig.name]: evaluationConfig.instruction,
    };

    localStorage.setItem(
      "EVALUATION_CONFIGS",
      JSON.stringify(newEvaluationConfigsJson)
    );

    setStoredEvaluationConfigs(newEvaluationConfigsJson);

    // const formData = new FormData();

    // formData.append("model", model);
    // formData.append("instruction", evaluationConfig.instruction);

    // questions.forEach((question, index) => {
    //   formData.append(`questions[${index}][type]`, question.type);
    //   formData.append(`questions[${index}][value]`, question.value);
    // });

    // entries(questionFiles).forEach(([fileName, file], index) => {
    //   formData.append(`files[${index}][fileName]`, fileName);
    //   formData.append(`files[${index}][file]`, file);
    // });

    // formData.append("answer", answer);

    await axios
      .request({
        method: "post",
        url: "/api/generate-text",
        data: {
          model,
          instruction: evaluationConfig.instruction,
          questions,
          answers,
        },
      })
      .then(({ data }) => {
        setServerResponse(data);

        if (isNil(data?.text) || isEmpty(data?.text) || !isEmpty(data?.error)) {
          console.error("PLAYGROUND_ERROR:", data.error);

          setError(
            "No response from server. Check console log for more detail"
          );

          return;
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    // await fetch("/api/generate-text", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     prompt: markdown,
    //     model,
    //   }),
    // })
    //   .then((response) => {
    //     response.json().then((json) => {
    //       if (
    //         isNil(json?.text) ||
    //         isEmpty(json?.text) ||
    //         !isEmpty(json?.error)
    //       ) {
    //         console.error("PLAYGROUND_ERROR:", json.error);

    //         setError(
    //           "No response from server. Check console log for more detail"
    //         );

    //         return;
    //       }

    //       setGeneration(json.text);
    //     });
    //   })
    //   .finally(() => {
    //     setIsLoading(false);
    //   });
  };

  console.log("questions", questions);

  useEffect(() => {
    const arStoredEvaluationConfigsKey = keys(storedEvaluationConfigs);
    if (arStoredEvaluationConfigsKey.length === 0) return;

    if (
      !(
        isEmpty(evaluationConfig?.name) &&
        isEmpty(evaluationConfig?.instruction)
      )
    ) {
      return;
    }

    const firstConfigKey = arStoredEvaluationConfigsKey[0];

    setEvaluationConfig({
      name: firstConfigKey,
      instruction: storedEvaluationConfigs[firstConfigKey],
    });
  }, [evaluationConfig, storedEvaluationConfigs]);

  return (
    <form className="flex h-screen w-screen flex-col gap-10 overflow-x-hidden px-8 pb-32 pt-8">
      <h1 className="text-center text-2xl font-semibold capitalize">
        Question format playground
      </h1>

      <div className="flex flex-nowrap gap-8">
        <div className="flex flex-shrink-0 basis-1/2 flex-col gap-6 rounded-md border border-solid border-gray-400 p-3">
          <div>
            <button
              type="button"
              className="rounded-3xl cursor-pointer border border-solid border-gray-400 px-2 py-1 text-sm hover:bg-gray-400 hover:text-white"
              onClick={() => {
                handleAddSampleIntoFormData("sample_1");
              }}
            >
              Sample 1
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold">Evaluation configs</label>

            <label className="ml-2 flex items-center gap-2">
              <span className="text-sm">select stored configs:</span>

              <select
                className="min-w-20 rounded-sm border border-solid border-gray-300"
                onChange={(event) => {
                  const configKey = event.target.value;

                  setEvaluationConfig({
                    name: configKey,
                    instruction: storedEvaluationConfigs[configKey],
                  });
                }}
              >
                {keys(storedEvaluationConfigs).map((k) => {
                  return (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  );
                })}
              </select>
            </label>

            <label className="ml-2 flex flex-col">
              <span className="text-sm">name(level):</span>

              <input
                className="rounded-sm border border-solid border-gray-300"
                value={evaluationConfig.name}
                onChange={(event) => {
                  setEvaluationConfig((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }));
                }}
              />
            </label>

            <label className="ml-2 flex flex-col">
              <span className="text-sm">instruction:</span>
              <textarea
                rows={3}
                className="rounded-sm border border-solid border-gray-300"
                value={evaluationConfig.instruction}
                onChange={(event) => {
                  setEvaluationConfig((prev) => ({
                    ...prev,
                    instruction: event.target.value,
                  }));
                }}
              ></textarea>
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold">Question configs</label>

            {questions.map(({ key, type, value }, index) => {
              let control = null;

              switch (type) {
                case "image":
                  control = (
                    <input
                      className="flex-1 rounded-sm border border-solid border-gray-300"
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const files = event.target.files;

                        if (isNil(files) || isNil(files[0])) return;

                        // const fileId = `file_${index}`;

                        // setQuestionFiles((prev) => {
                        //   return {
                        //     ...prev,
                        //     [fileId]: files[0],
                        //   };
                        // });

                        // setQuestions((prev) => {
                        //   const newQuestions = [...prev];
                        //   newQuestions[index].value = fileId;

                        //   return newQuestions;
                        // });

                        const fr = new FileReader();

                        fr.readAsDataURL(files[0]);

                        fr.addEventListener("load", (event) => {
                          setQuestions((prev) => {
                            const newQuestions = [...prev];
                            newQuestions[index].value = String(
                              event.target?.result
                            );

                            return newQuestions;
                          });
                        });
                      }}
                    />
                  );
                  break;
                case "audio":
                  control = (
                    <input
                      className="flex-1 rounded-sm border border-solid border-gray-300"
                      type="file"
                      accept="audio/mpeg"
                      onChange={(event) => {
                        const files = event.target.files;

                        if (isNil(files) || isNil(files[0])) return;

                        // const fileId = `file_${index}`;

                        // setQuestionFiles((prev) => {
                        //   return {
                        //     ...prev,
                        //     [fileId]: files[0],
                        //   };
                        // });

                        // setQuestions((prev) => {
                        //   const newQuestions = [...prev];
                        //   newQuestions[index].value = fileId;

                        //   return newQuestions;
                        // });

                        const fr = new FileReader();

                        fr.readAsDataURL(files[0]);

                        fr.addEventListener("load", (event) => {
                          setQuestions((prev) => {
                            const newQuestions = [...prev];
                            newQuestions[index].value = String(
                              event.target?.result
                            );

                            return newQuestions;
                          });
                        });
                      }}
                    />
                  );
                  break;
                default:
                  control = (
                    <textarea
                      rows={3}
                      className="flex-1 rounded-sm border border-solid border-gray-300"
                      value={String(value)}
                      onChange={(event) => {
                        setQuestions((prev) => {
                          const newQuestions = [...prev];
                          newQuestions[index].value = event.target.value;

                          return newQuestions;
                        });
                      }}
                    ></textarea>
                  );
              }

              return (
                <div key={key} className="flex justify-between gap-2">
                  {control}
                  <span
                    className="shrink-0 cursor-pointer"
                    onClick={() => {
                      setQuestions((prev) => {
                        return [...prev].filter(
                          (question) => question.key !== key
                        );
                      });
                    }}
                  >
                    ❌
                  </span>
                </div>
              );
            })}

            <div className="flex items-center gap-4 [&>button]:cursor-pointer">
              <button
                type="button"
                onClick={() => {
                  setQuestions((prev) => [
                    ...prev,
                    {
                      key: uniqueId("question"),
                      type: "text",
                      value: "",
                    },
                  ]);
                }}
              >
                ➕ text
              </button>

              <button
                type="button"
                onClick={() => {
                  const { support, message } =
                    validateModalitiesSupport("image");

                  if (!support) {
                    alert(message);
                    return;
                  }

                  setQuestions((prev) => [
                    ...prev,
                    {
                      key: uniqueId("question"),
                      type: "image",
                      value: "",
                    },
                  ]);
                }}
              >
                ➕ image
              </button>

              <button
                type="button"
                onClick={() => {
                  const { support, message } =
                    validateModalitiesSupport("audio");

                  if (!support) {
                    alert(message);
                    return;
                  }

                  setQuestions((prev) => [
                    ...prev,
                    {
                      key: uniqueId("question"),
                      type: "audio",
                      value: "",
                    },
                  ]);
                }}
              >
                ➕ audio
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold">Answer</label>

            {answers.map(({ key, type, value }, index) => {
              let control = null;

              switch (type) {
                case "image":
                  control = (
                    <Input
                      className="flex-1"
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const files = event.target.files;

                        if (isNil(files) || isNil(files[0])) return;

                        const fr = new FileReader();

                        fr.readAsDataURL(files[0]);

                        fr.addEventListener("load", (event) => {
                          setAnswers((prev) => {
                            const newAnswers = [...prev];
                            newAnswers[index].value = String(
                              event.target?.result
                            );

                            return newAnswers;
                          });
                        });
                      }}
                    />
                  );
                  break;
                case "audio":
                  control = (
                    <Input
                      className="flex-1"
                      type="file"
                      accept="audio/mpeg"
                      onChange={(event) => {
                        const files = event.target.files;

                        if (isNil(files) || isNil(files[0])) return;

                        const fr = new FileReader();

                        fr.readAsDataURL(files[0]);

                        fr.addEventListener("load", (event) => {
                          setAnswers((prev) => {
                            const newAnswers = [...prev];
                            newAnswers[index].value = String(
                              event.target?.result
                            );

                            return newAnswers;
                          });
                        });
                      }}
                    />
                  );
                  break;
                default:
                  control = (
                    <textarea
                      rows={3}
                      className="flex-1 rounded-sm border border-solid border-gray-300"
                      value={String(value)}
                      onChange={(event) => {
                        setAnswers((prev) => {
                          const newAnswers = [...prev];
                          newAnswers[index].value = event.target.value;

                          return newAnswers;
                        });
                      }}
                    ></textarea>
                  );
              }

              return (
                <div key={key} className="flex justify-between gap-2">
                  {control}
                  <span
                    className="shrink-0 cursor-pointer"
                    onClick={() => {
                      setAnswers((prev) => {
                        return [...prev].filter(
                          (question) => question.key !== key
                        );
                      });
                    }}
                  >
                    ❌
                  </span>
                </div>
              );
            })}

            <div className="flex items-center gap-4 [&>button]:cursor-pointer">
              <button
                type="button"
                onClick={() => {
                  setAnswers((prev) => [
                    ...prev,
                    {
                      key: uniqueId("answer"),
                      type: "text",
                      value: "",
                    },
                  ]);
                }}
              >
                ➕ text
              </button>

              <button
                type="button"
                onClick={() => {
                  const { support, message } =
                    validateModalitiesSupport("image");

                  if (!support) {
                    alert(message);
                    return;
                  }

                  setAnswers((prev) => [
                    ...prev,
                    {
                      key: uniqueId("answer"),
                      type: "image",
                      value: "",
                    },
                  ]);
                }}
              >
                ➕ image
              </button>

              <button
                type="button"
                onClick={() => {
                  const { support, message } =
                    validateModalitiesSupport("audio");

                  if (!support) {
                    alert(message);
                    return;
                  }

                  setAnswers((prev) => [
                    ...prev,
                    {
                      key: uniqueId("answer"),
                      type: "audio",
                      value: "",
                    },
                  ]);
                }}
              >
                ➕ audio
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label>Select AI model</label>
            <select
              className="w-40 rounded-sm border border-solid border-gray-300"
              value={model}
              onChange={(event) => {
                setModel(event.target.value);
              }}
            >
              <option value={"gpt-4.1"}>gpt-4.1</option>
              <option value={"gpt-4o-audio-preview"}>
                gpt-4o-audio-preview
              </option>
              <option value={"gpt-4o"}>gpt-4o</option>
              <option value={"o4-mini"}>o4-mini</option>
              <option value={"o3"}>o3</option>
              <option value={"o3-mini"}>o3-mini</option>
            </select>
          </div>
        </div>

        <div className="flex basis-1/2 overflow-hidden flex-col rounded-md">
          <div className="mt-2 flex flex-col gap-3">
            <span className="text-2xl">AI response: </span>
            <div className="rounded-lg bg-slate-200 p-3">
              {isString(error) ? (
                <i className="text-sm">{error}</i>
              ) : (
                // <ReactJsonView
                //   name={null}
                //   src={parseJson(serverResponse?.text) || {}}
                //   displayDataTypes={false}
                //   displayObjectSize={false}
                // />

                <div className="flex flex-col gap-4">
                  {entries(parseJson(serverResponse?.text)).map(([k, v]) => {
                    return (
                      <div key={k} className="flex gap-4">
                        <span className="basis-1/3">{k}:</span>
                        <span className="basis-2/3">{v as ReactNode}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <hr className="my-4" />

          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold">API response:</p>

              {/* {showCopiedText ? (
                <p className="text-sm font-medium text-green-500">Copied ✅</p>
              ) : (
                <button
                  type="button"
                  className="cursor-pointer opacity-40 hover:opacity-100"
                  onClick={() => {
                    // navigator.clipboard.writeText(markdown);

                    setShowCopiedText(true);

                    setTimeout(() => {
                      setShowCopiedText(false);
                    }, 1.5 * 1000);
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 26.6562H6.65625C5.78125 26.6562 4.9375 26.4896 4.125 26.1562C3.3125 25.8229 2.59375 25.3438 1.96875 24.7188C1.34375 24.0938 0.854167 23.375 0.5 22.5625C0.166667 21.7292 0 20.875 0 20V6.65625C0 5.78125 0.166667 4.9375 0.5 4.125C0.854167 3.3125 1.34375 2.59375 1.96875 1.96875C2.59375 1.34375 3.3125 0.864583 4.125 0.53125C4.9375 0.177083 5.78125 0 6.65625 0H20C20.875 0 21.7188 0.177083 22.5312 0.53125C23.3646 0.864583 24.0938 1.34375 24.7188 1.96875C25.3438 2.59375 25.8229 3.3125 26.1562 4.125C26.4896 4.9375 26.6562 5.78125 26.6562 6.65625V20C26.6562 20.875 26.4896 21.7292 26.1562 22.5625C25.8229 23.375 25.3438 24.0938 24.7188 24.7188C24.0938 25.3438 23.3646 25.8229 22.5312 26.1562C21.7188 26.4896 20.875 26.6562 20 26.6562ZM6.65625 2.65625C6.13542 2.65625 5.625 2.76042 5.125 2.96875C4.64583 3.17708 4.21875 3.46875 3.84375 3.84375C3.46875 4.21875 3.17708 4.65625 2.96875 5.15625C2.76042 5.63542 2.65625 6.13542 2.65625 6.65625V20C2.65625 20.5208 2.76042 21.0312 2.96875 21.5312C3.17708 22.0312 3.46875 22.4688 3.84375 22.8438C4.21875 23.2188 4.64583 23.5104 5.125 23.7188C5.625 23.9062 6.13542 24 6.65625 24H20C20.5208 24 21.0312 23.9062 21.5312 23.7188C22.0312 23.5104 22.4688 23.2188 22.8438 22.8438C23.2188 22.4688 23.5 22.0312 23.6875 21.5312C23.8958 21.0312 24 20.5208 24 20V6.65625C24 6.13542 23.8958 5.63542 23.6875 5.15625C23.5 4.65625 23.2188 4.21875 22.8438 3.84375C22.4688 3.46875 22.0312 3.17708 21.5312 2.96875C21.0312 2.76042 20.5208 2.65625 20 2.65625H6.65625ZM32 25.3438V8C32 7.83333 31.9688 7.66667 31.9062 7.5C31.8438 7.33333 31.75 7.1875 31.625 7.0625C31.5 6.9375 31.3542 6.84375 31.1875 6.78125C31.0208 6.69792 30.8438 6.65625 30.6562 6.65625C30.4896 6.65625 30.3229 6.69792 30.1562 6.78125C29.9896 6.84375 29.8438 6.9375 29.7188 7.0625C29.5938 7.1875 29.5 7.33333 29.4375 7.5C29.375 7.66667 29.3438 7.83333 29.3438 8V25.3438C29.3438 25.8646 29.2396 26.375 29.0312 26.875C28.8229 27.3542 28.5312 27.7812 28.1562 28.1562C27.7812 28.5312 27.3438 28.8229 26.8438 29.0312C26.3646 29.2396 25.8646 29.3438 25.3438 29.3438H8C7.83333 29.3438 7.66667 29.375 7.5 29.4375C7.33333 29.5 7.1875 29.5938 7.0625 29.7188C6.9375 29.8438 6.83333 29.9896 6.75 30.1562C6.6875 30.3229 6.65625 30.4896 6.65625 30.6562C6.65625 30.8438 6.6875 31.0208 6.75 31.1875C6.83333 31.3542 6.9375 31.5 7.0625 31.625C7.1875 31.75 7.33333 31.8438 7.5 31.9062C7.66667 31.9688 7.83333 32 8 32H25.3438C26.2188 32 27.0625 31.8229 27.875 31.4688C28.6875 31.1354 29.4062 30.6562 30.0312 30.0312C30.6562 29.4062 31.1354 28.6875 31.4688 27.875C31.8229 27.0625 32 26.2188 32 25.3438Z"
                      fill="#0F172A"
                    />
                  </svg>
                </button>
              )} */}
            </div>

            <div className="relative rounded-lg bg-slate-200 p-3 w-full overflow-x-auto">
              <ReactJsonView
                name={null}
                src={serverResponse || {}}
                displayDataTypes={false}
                displayObjectSize={false}
                collapsed
              />
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
            disabled={
              isLoading ||
              isEmpty(evaluationConfig?.instruction) ||
              isEmpty(questions) ||
              isEmpty(answers)
            }
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

export default CambridgePlayground;

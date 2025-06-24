import { getApiErrorMessage } from "@/app/utils/api.util";
import { openai } from "@ai-sdk/openai";
import { CoreMessage, generateText, UserContent } from "ai";
import { isEmpty } from "lodash";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const req = await request.json();

    const model = req?.model;
    const instruction = req?.instruction;
    const questions = req?.questions;
    const answers = req?.answers;

    // while (true) {
    //   const fileName = formData.get(`files[${fileIndex}][fileName]`);
    //   const file = formData.get(`files[${fileIndex}][file]`) as File;

    //   // If we don't find a question at this index, we're done
    //   if (isNil(fileName) && isNil(file)) {
    //     break;
    //   }

    //   files.push({
    //     fileName: String(fileName),
    //     file,
    //   });

    //   fileIndex++;
    // }

    if (isEmpty(instruction)) {
      throw new Error("instruction is not specified");
    }

    if (isEmpty(questions)) {
      throw new Error("questions is not specified");
    }

    if (isEmpty(answers)) {
      throw new Error("answers is not specified");
    }

    // * instruction
    const instructionMessage: CoreMessage = {
      role: "user",
      content: [
        {
          type: "text",
          text: "### Evaluation Instructions",
        },
        {
          type: "text",
          text: String(instruction),
        },
      ],
    };

    // * questions
    const questionsMessageContent: UserContent = [
      {
        type: "text",
        text: "### Question to Evaluate",
      },
    ];
    questions?.forEach(({ type, value }: { type: string; value: string }) => {
      switch (type) {
        case "image": {
          questionsMessageContent.push({
            type: "image",
            image: value,
          });
          break;
        }
        case "audio": {
          questionsMessageContent.push({
            type: "file",
            mimeType: "audio/mpeg",
            data: value,
          });
          break;
        }
        default:
          questionsMessageContent.push({
            type: "text",
            text: String(value),
          });
      }
    });
    const questionsMessage: CoreMessage = {
      role: "user",
      content: questionsMessageContent,
    };

    // * answers
    const answersMessageContent: UserContent = [
      {
        type: "text",
        text: "### Student's Answer",
      },
    ];
    answers?.forEach(({ type, value }: { type: string; value: string }) => {
      switch (type) {
        case "image": {
          answersMessageContent.push({
            type: "image",
            image: value,
          });
          break;
        }
        case "audio": {
          answersMessageContent.push({
            type: "file",
            mimeType: "audio/mpeg",
            data: value,
          });
          break;
        }
        default:
          answersMessageContent.push({
            type: "text",
            text: String(value),
          });
      }
    });
    const answersMessage: CoreMessage = {
      role: "user",
      content: answersMessageContent,
    };

    // return Response.json({});

    const response = await generateText({
      model: openai(String(model) || "gpt-4.1"),
      system: `**Role**: You are a Cambridge Assessment English examiner.
- First of all, you need to remove all previous context.

- The user will give you the evaluation instructions, the question to evaluate, and the student's answer.

- Using this input, you need to calculate the score with the scoring task like this:
1. **Scoring Criteria Validation**: 
   - Validate the criterion input is valid or not
   - The length of each criterion string is not too short.

2. **Score Assignment**: 
   - Apply the Cambridge band descriptors from the Evaluation Instructions
   - Assign a numerical score

3. **Feedback Generation**:
   - Highlight 1 strength and 1 weakness specific to the answer
   - Reference exact phrases/examples from the student's answer
   - Suggest 1 concrete improvement

4. **Output Format**: respond with a raw JSON string object in the following format, no extra text or format text:
{
  "score": [number],
  "band_descriptor": "[e.g., Mover]",
  "strength": "[specific observation with quote]",
  "weakness": "[specific issue with quote]",
  "improvement_suggestion": "[actionable advice]"
}`,
      messages: [instructionMessage, questionsMessage, answersMessage],
    });

    return Response.json({ ...response });
  } catch (error) {
    return Response.json({ text: "", error: getApiErrorMessage(error) });
  }
}

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
    const answer = req?.answer;

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

    if (isEmpty(answer)) {
      throw new Error("answer is not specified");
    }

    const questionMessageContent: UserContent = [
      {
        type: "text",
        text: "### Question to Evaluate",
      },
    ];

    req?.questions?.forEach(
      ({ type, value }: { type: string; value: string }) => {
        switch (type) {
          case "image": {
            questionMessageContent.push({
              type: "image",
              image: value,
            });
            break;
          }
          case "audio": {
            questionMessageContent.push({
              type: "file",
              mimeType: "audio/mpeg",
              data: value,
            });
            break;
          }
          default:
            questionMessageContent.push({
              type: "text",
              text: String(value),
            });
        }
      }
    );

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

    const questionMessage: CoreMessage = {
      role: "user",
      content: questionMessageContent,
    };

    const answerMessage: CoreMessage = {
      role: "user",
      content: [
        {
          type: "text",
          text: "### Student's Answer",
        },
        {
          type: "text",
          text: String(answer),
        },
      ],
    };

    console.log("REQUEST", questionMessage);

    // return Response.json({});

    const response = await generateText({
      model: openai(String(model) || "gpt-4o"),
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
      messages: [instructionMessage, questionMessage, answerMessage],
    });

    return Response.json({ ...response });
  } catch (error) {
    console.error(error);
    return Response.json({ text: "", error: getApiErrorMessage(error) });
  }
}

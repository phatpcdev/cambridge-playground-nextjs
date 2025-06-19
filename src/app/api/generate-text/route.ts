import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { isEmpty } from "lodash";
import { getApiErrorMessage } from "@/app/utils/api.util";

export async function POST(request: NextRequest) {
  try {
    const res = await request.json();

    if (isEmpty(res?.prompt)) {
      throw new Error("Prompt is not specified");
    }

    const response = await generateText({
      model: openai(res?.model || "gpt-4.1"),
      prompt: res.prompt,
    });

    return Response.json({ ...response });
  } catch (error) {
    return Response.json({ text: "", error: getApiErrorMessage(error) });
  }
}

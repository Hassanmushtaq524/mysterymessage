import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

/////////////////////////////////////
// NOT TESTED YET, INTEGRATE LATER //
/////////////////////////////////////

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function GET(req: Request) {
    try {
        const prompt = "Write anything // testing";
        const result = streamText({
            model: openai('gpt-4o-mini'),
            prompt: prompt
        });

        return result.toDataStreamResponse();
  } catch (error) {
        console.error("An unexpected error occurred ", error);
        return Response.json({
            success: false,
            message: "Internal server error"
        }, {
            status: 500
        })
  }
}
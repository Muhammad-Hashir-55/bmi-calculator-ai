import { Groq } from 'groq-sdk';
import { NextRequest } from 'next/server';
import type { BmiData, ChatMessage } from '@/lib/store';

export const runtime = 'edge';

type ChatRequestBody = {
    messages: ChatMessage[];
    bmiData?: BmiData;
};

export async function POST(req: NextRequest) {
    try {
        const { messages, bmiData } = await req.json() as ChatRequestBody;

        const key = process.env.GROQ_API_KEY;

        if (!key) {
            return new Response(JSON.stringify({ error: 'Groq API Key not found in environment' }), { status: 500 });
        }

        const groq = new Groq({ apiKey: key });

        const systemPrompt = `You are an expert, concise, practical, and slightly witty AI health assistant.
User's current health context:
Height: ${bmiData?.height || 'Unknown'} cm
Weight: ${bmiData?.weight || 'Unknown'} kg
Age: ${bmiData?.age || 'Unknown'}
Gender: ${bmiData?.gender || 'Unknown'}
BMI: ${bmiData?.bmi || 'Unknown'} (${bmiData?.category || 'Unknown'})

Provide practical diet and workout suggestions based on this context. Keep responses highly actionable, engaging, and under 3 paragraphs. Use markdown formatting.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
                    .filter((message) => message.role !== 'system')
                    .map((message) => ({ role: message.role, content: message.content }))
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: true,
            stop: null
        });

        const readableStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of chatCompletion) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`));
                        }
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                }
            }
        });

        return new Response(readableStream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });

    } catch (error) {
        console.error('Chat API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to process chat request' }), { status: 500 });
    }
}

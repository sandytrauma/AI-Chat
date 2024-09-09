import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI with API Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 300,
      top_p: 1,  
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    return NextResponse.json({ bot: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
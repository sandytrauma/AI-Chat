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
      model: 'gpt-3.5-turbo-0125',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,  
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    console.log('OpenAI response:', response);

    // Check response structure
    if (response.choices && response.choices.length > 0) {
      return NextResponse.json({ bot: response.choices[0].message.content }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'No choices returned' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in OpenAI request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

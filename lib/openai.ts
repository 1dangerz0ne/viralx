import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateMemeArt(thread: string): Promise<string> {
  // Compose prompt from thread
  const prompt = `Create a 1:1 funny meme illustration based on this X (Twitter) thread for an NFT cover. Draw vivid, pop-culture digital art.\nThread: ${thread}`;
  const art = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    style: 'vivid',
    response_format: 'url',
    // We could add more options if needed
  });
  return art.data[0]?.url;
}

import { GoogleGenAI } from "@google/genai";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function getEmbedding(text: string): Promise<number[]> {
  const result = await gemini.models.embedContent({
    model: "text-embedding-004",
    contents: text,
  });
  const emb = result.embeddings;
  if (!emb || emb.length === 0 || !emb[0].values) {
    throw new Error("No embeddings returned from Gemini API");
  }
  console.log(`Embedding dimension: ${emb[0].values.length}`);
  return emb[0].values;
}

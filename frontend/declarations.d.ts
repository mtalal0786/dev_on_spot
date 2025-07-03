// declarations.d.ts
declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(config: { apiKey: string });
    models: {
      generateContent(options: { model: string; contents: string; config?: object }): Promise<{ text: string }>;
    };
  }
}

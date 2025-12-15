import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert Rust developer specializing in the 'ratatui' crate (formerly tui-rs).
Your role is to act as an interactive documentation and code generator for users building Terminal User Interfaces (TUIs).

Guidelines:
1. **Code First**: When asked how to do something, prioritize showing a complete, compilable Rust code snippet.
2. **Modern Practices**: Use the latest patterns from Ratatui (e.g., \`Frame\`, \`Ratatui::prelude::*\`, modern \`Crossterm\` backend setup).
3. **Explanations**: Briefly explain the widgets, layout constraints, or event loops used in the code.
4. **Style**: Format your response using Markdown. Use Rust syntax highlighting for code blocks.
5. **Context**: If the user asks about "widgets", mention common ones like \`Paragraph\`, \`List\`, \`Table\`, \`Gauge\`, and \`Chart\`.

Example snippet style:
\`\`\`rust
use ratatui::{prelude::*, widgets::*};
// ... clear setup code
\`\`\`
`;

export const sendMessageToGemini = async (
  history: Message[],
  userMessage: string
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing. Please checking your environment configuration.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct a chat history for context if needed, 
    // but for simplicity in this specific app logic, we often just start a fresh generation 
    // or keep a simple context. Here we will use a fresh chat session for each major turn 
    // or maintain a chat object if we wanted multi-turn. 
    // For this implementation, we will use a stateful chat approach assuming the component manages the instance,
    // but here we just do a single turn with history context packed if possible, 
    // or just use generateContent for simplicity as per instructions to be robust.
    
    // To support true conversation, we should use ai.chats.create
    // However, since we are stateless in this service function, let's just use generateContent 
    // with the user message + system instruction. 
    // For better results in a 'Chat' app, we typically map the history.
    
    // Let's use the Chat API properly.
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.slice(0, -1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage({
      message: userMessage,
    });

    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with Ratatui Assistant.");
  }
};
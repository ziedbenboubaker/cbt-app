
import { GoogleGenAI, Chat } from "@google/genai";
import { KNOWLEDGE_BASE } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export function createCbtChat(): Chat {
    const chat = ai.chats.create({
        model: 'gemini-2.5-pro',
        config: {
          thinkingConfig: { thinkingBudget: 32768 }
        },
        history: [
            {
                role: "user",
                parts: [{ text: KNOWLEDGE_BASE }]
            },
            {
                role: "model",
                parts: [{ text: "نعم، فهمت. أنا 'مساعدك العلاجي الشخصي'. سأتبع الخطة العلاجية بدقة. أنا جاهز للبدء. من فضلك، صف لي شعورك الآن (الخطوة 0)." }]
            }
        ]
    });
    return chat;
}

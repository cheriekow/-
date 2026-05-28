import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3001;

  app.use(express.json());

  // API router for parsing text
  app.post("/api/extract", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Input text is required." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY environment variable is required. Please add it to your Secrets under Settings.",
          isKeyMissing: true
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `你是一个专为情侣设计的智能记账助手。你的任务是从用户的日常自然语言输入中，提取出消费记录，并严格输出为 JSON 格式。

【核心逻辑】
情侣日常开销默认是两人平摊（50/50）。如果其中一人支付了共同开支，意味着另一半欠付款人一半的金额。

【JSON 输出结构】
- "payer": "me" | "partner" （付款人："me" 代表输入者本人，"partner" 代表另一半）
- "amount": number （支付的总金额，纯数字）
- "currency": string （货币单位，默认为 "RM"）
- "description": string （消费内容，如 "晚餐"、"打车"）
- "date": string （消费时间，如 "today", "yesterday"，或具体日期如 "2026-05-27"）
- "is_shared": boolean （是否是两人共同开销，如果平摊默认为 true。如果是帮对方个人垫付/代买，则是 false）

【处理规则】
1. 识别“我”、“买的”、“付的”等隐含第一人称时，payer 为 "me"。
2. 识别“他”、“女朋友”、“男朋友”、“另一半”、“宝宝”或名字等第二人称指示代词时，payer 为 "partner"。
3. 如果未指定货币，默认使用 "RM"。
4. 绝对严格地遵循指定的 JSON Schema 格式。不要包含任何 Markdown \`\`\` 块或多余问候。`;

      const prompt = `用户输入：${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              payer: { 
                type: Type.STRING, 
                enum: ["me", "partner"],
                description: "付款人：me 代表本人付款，partner 代表另一半付款" 
              },
              amount: { 
                type: Type.NUMBER, 
                description: "支付的总金额（纯数值，不含货币符号）" 
              },
              currency: { 
                type: Type.STRING, 
                description: "货币名称或符号，如果未指定则默认 'RM'" 
              },
              description: { 
                type: Type.STRING, 
                description: "消费的物品或内容简述" 
              },
              date: { 
                type: Type.STRING, 
                description: "发生的日期：当提到今天或没有透露日期时为 'today'，昨天为 'yesterday'，其他指定日期输出 'YYYY-MM-DD'" 
              },
              is_shared: { 
                type: Type.BOOLEAN, 
                description: "是否是两人共同均摊。如果是垫付给对方买Ta个人的东西，则为 false，平摊为 true" 
              }
            },
            required: ["payer", "amount", "currency", "description", "date", "is_shared"]
          }
        }
      });

      const extractedText = response.text;
      if (!extractedText) {
        throw new Error("No response generated from Gemini API.");
      }

      // Parse JSON ensure format
      const cleanedText = extractedText.trim();
      const result = JSON.parse(cleanedText);
      res.json(result);
    } catch (error: any) {
      console.error("Gemini Extraction Error:", error);
      res.status(500).json({ error: error?.message || "Internal server error during extraction." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: 24679 } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CoupleLedger custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

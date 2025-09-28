import "dotenv/config"

export const generateText = async (prompt: string, onMessageRender: (message: string) => void) => {
    const url = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
    };
    const payload = {
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
            {
                role: "system",
                content: "คุณคือผู้ประกาศประชาสัมพันธ์ และคุณต้องตอบเป็นภาษาไทย ตอบแต่ข้อความภาษาไทยเท่านั้นไม่ต้องมีสัญลักษณ์พิเศษอื่นๆ และตอบแค่ข้อมูลที่ได้รับมาเท่านั้น ถ้าข้อมูลนั้นว่างเปล่าบอกแค่ว่าไม่มี"
            },
            {
                role: "user",
                content: prompt
            }
        ],
        // temperature: 0.6,
        // max_tokens: 100,
        // top_p: 0.6,
        stream: true
    };

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
    });

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let sentenceBuffer = "";

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            while (true) {
                const lineEnd = buffer.indexOf("\n");
                if (lineEnd === -1) break;

                const line = buffer.slice(0, lineEnd).trim();
                buffer = buffer.slice(lineEnd + 1);

                if (line.startsWith("data: ")) {
                    const data = line.slice(6);
                    if (data === "[DONE]") break;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0].delta.content;
                        if (content) {
                            sentenceBuffer += content;

                            // ตัดออกเป็นประโยคๆ
                            const sentences = sentenceBuffer.split(/(?<=[.!?ฯ])\s*/);

                            // ประโยคสุดท้ายเก็บไว้ต่อ (เพราะอาจจะยังไม่จบจริงๆ)
                            sentenceBuffer = sentences.pop() || "";

                            // ส่งเฉพาะประโยคที่จบแล้ว
                            for (const s of sentences) {
                                if (s.trim().length > 0) {
                                    onMessageRender(s.trim());
                                }
                            }
                        }
                    } catch {
                        // ignore invalid JSON
                    }
                }
            }
        }

        // เผื่อว่ามีเศษประโยคที่ไม่จบ แต่ยังเหลือ
        if (sentenceBuffer.trim().length > 0) {
            onMessageRender(sentenceBuffer.trim())
        }
    } finally {
        reader.cancel();
    }
};

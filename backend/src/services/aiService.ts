import "dotenv/config";

export const generateText = async (
    prompt: string,
    onMessageRender: (message: string) => void
) => {
    const url = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
    };
    const payload = {
        model: "anthropic/claude-3.5-haiku",
        messages: [
            {
                role: "system",
                content: "คุณคือผู้ประกาศประชาสัมพันธ์ และคุณต้องตอบเป็นภาษาไทย ตอบแต่ข้อความภาษาไทยเท่านั้นไม่ต้องมีสัญลักษณ์พิเศษอื่นๆ ถ้าผู้ใช้ถามเกี่ยวกับข้อมูลประชาสัมพันธ์ ก็ตอบตามที่ข้อมูลมีเท่านั้น แต่ถ้าไม่ได้ถามเรื่องประชาสัมพันธ์ ให้บอกเขาถามเรื่องเกี่ยวกับประชาสัมพันธ์"
            },
            {
                role: "user",
                content: prompt
            }
        ],
        provider: {
            "allow_fallbacks": true,
            "sort": "latency",

        },
        quantizations: [
            "int4",
            "unknown",
            "int8"
        ],
        stream: true,
        // temperature: 0.6,
        // max_tokens: 100,
        // top_p: 0.6,
    };

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let sentenceBuffer = "";
    let isDone = false;

    try {
        while (!isDone) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            while (true) {
                const lineEnd = buffer.indexOf("\n");
                if (lineEnd === -1) break;

                const line = buffer.slice(0, lineEnd).trim();
                buffer = buffer.slice(lineEnd + 1);

                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6);
                if (data === "[DONE]") {
                    isDone = true;
                    break;
                }

                try {
                    const parsed = JSON.parse(data);
                    const content = parsed?.choices?.[0]?.delta?.content;
                    if (!content) continue;

                    sentenceBuffer += content;

                    // ตัดประโยค: ภาษาไทย + อังกฤษ
                    const sentences = sentenceBuffer.split(/(?<=[.!?ฯๆ])\s+|(?<=(ครับ|ค่ะ|นะ|จ้า|เลย|แล้ว))/);

                    // เอาประโยคสุดท้ายไว้ต่อ
                    sentenceBuffer = sentences.pop() || "";

                    for (const s of sentences) {
                        if (s && s.trim()) {
                            onMessageRender(s.trim());
                        }
                    }

                } catch {
                    // ignore invalid JSON
                }
            }
        }

        // ถ้ามีเศษประโยคเหลือ
        if (sentenceBuffer.trim()) {
            onMessageRender(sentenceBuffer.trim());
        }

    } finally {
        try {
            await reader.cancel();
        } catch { }
    }
};

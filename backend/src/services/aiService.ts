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
                content: `
                    คุณคือผู้ประกาศประชาสัมพันธ์ และคุณต้องตอบเป็นภาษาไทย ตอบแต่ข้อความภาษาไทยเท่านั้นไม่ต้องมีสัญลักษณ์พิเศษอื่นๆ ถ้าผู้ใช้ถามเกี่ยวกับข้อมูลประชาสัมพันธ์ ก็ตอบตามที่ข้อมูลมีเท่านั้น แต่ถ้าไม่ได้ถามเรื่องประชาสัมพันธ์ ให้บอกเขาถามเรื่องเกี่ยวกับประชาสัมพันธ์
                `
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
    let currentSentence = "";
    let isInQuote = false;
    let isInParenthesis = false;

    // คำลงท้ายที่เจอแล้วน่าจะจบประโยค
    const endMarkers = new Set([
        'ครับ', 'ค่ะ', 'นะ', 'จ้ะ', 'คะ', 'น้า', 'น๊า', 'น่ะ',
        'เลย', 'แล้ว', 'แหละ', 'ล่ะ', 'หน่อย', 'สิ', 'อะ', 'อ่ะ',
        'มั้ย', 'ไหม', 'รึเปล่า', 'ใช่ไหม', 'ใช่มั้ย', 'ป่ะ', 'ปะ'
    ]);

    // ฟังก์ชันส่งประโยคทันที
    const flushSentence = () => {
        const trimmed = currentSentence.trim();
        if (trimmed) {
            onMessageRender(trimmed);
        }
        currentSentence = "";
    };

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // ประมวลผลทีละบรรทัด
            while (true) {
                const lineEnd = buffer.indexOf("\n");
                if (lineEnd === -1) break;

                const line = buffer.slice(0, lineEnd).trim();
                buffer = buffer.slice(lineEnd + 1);

                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6);
                if (data === "[DONE]") break;

                try {
                    const parsed = JSON.parse(data);
                    const content = parsed?.choices?.[0]?.delta?.content;
                    if (!content) continue;

                    // เพิ่มทีละตัวอักษร
                    for (const char of content) {
                        currentSentence += char;

                        // ติดตามสถานะวงเล็บ / คำพูด
                        if (char === '“' || char === '”' || char === '"') isInQuote = !isInQuote;
                        if (char === '(' || char === '【' || char === '『') isInParenthesis = true;
                        if (char === ')' || char === '】' || char === '』') isInParenthesis = false;

                        // ตรวจสอบจุดสิ้นสุดประโยค
                        const last2 = currentSentence.slice(-2);
                        const last3 = currentSentence.slice(-3);
                        const last4 = currentSentence.slice(-4);
                        const lastChar = char;

                        let shouldFlush = false;

                        // 1. วรรคตอนชัดเจน + ไม่ใช่คำย่อ
                        if (/[.!?ฯ]/.test(lastChar)) {
                            const prevChar = currentSentence[currentSentence.length - 2] as string;
                            // หลีกเลี่ยง พ.ศ. , น. , ฯลฯ
                            if (lastChar === '.' && /[A-Za-z0-9]/.test(prevChar)) continue;
                            if (lastChar === 'ฯ' && currentSentence.endsWith('ฯลฯ')) continue;

                            shouldFlush = true;
                        }
                        // 2. ปิดวงเล็บ / คำพูด
                        else if (/[")\]」』]/.test(lastChar) && !isInQuote && !isInParenthesis) {
                            shouldFlush = true;
                        }
                        // 3. คำลงท้าย + ช่องว่างหรือขึ้นบรรทัด
                        else if (/\s/.test(char)) {
                            const words = currentSentence.trim().split(/\s+/);
                            const lastWord = words[words.length - 1] as string;
                            if (endMarkers.has(lastWord)) {
                                shouldFlush = true;
                            }
                        }

                        // ส่งทันทีถ้าควร
                        if (shouldFlush && !isInQuote && !isInParenthesis) {
                            // ตรวจสอบว่าประโยคไม่สั้นเกินไป (ป้องกัน spam)
                            if (currentSentence.trim().length >= 8) {
                                flushSentence();
                            }
                        }
                    }

                } catch (e) {
                    // ignore JSON error
                }
            }
        }

        // สิ้นสุด stream → ส่งประโยคที่เหลือ
        if (currentSentence.trim()) {
            flushSentence();
        }

    } finally {
        try {
            await reader.cancel();
        } catch { }
    }
};
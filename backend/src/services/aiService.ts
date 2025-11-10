import "dotenv/config";

type GenerateTextConfig = {
    prompt: string,
    systemPrompt: string | undefined,
}

export const generateText = async (config: GenerateTextConfig): Promise<string> => {
    
    const url = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
    };

    const messages = []

    if (config.systemPrompt) {
        messages.push({
            role: "system",
            content: config.systemPrompt
        })
    }

    messages.push({
        role: "user",
        content: config.prompt
    })

    console.log("Messages:", messages)

    const payload = {
        model: "openai/gpt-4o-mini",
        messages: messages
    };

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json()
    console.log("Data:", data)
    const message: string = data.choices[0].message.content
    
    return message
}

/**
 * The function `generateText` sends a prompt to an API endpoint, processes the response data, and
 * renders the generated text messages using a provided callback function.
 * @param {string} prompt - The `prompt` parameter in the `generateText` function is a string that
 * represents the user input or message that will be sent to the API for text generation. This prompt
 * is used to provide context or information to the text generation model so that it can generate a
 * response based on the input provided by
 * @param onMessageRender - The `onMessageRender` parameter is a callback function that takes a string
 * message as an argument. This function is used to render or display the generated text messages to
 * the user interface. Each time a new message is generated, it should be passed to this callback
 * function for rendering on the screen.
 */
export const generateSteamingText = async (
    prompt: string,
    onMessageRender: (message: string) => void
) => {
   const url = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
    };
    const payload = {
        model: "openai/gpt-4o-mini:online",
        messages: [
            {
                role: "system",
                content: `
                    คุณคือผู้ประกาศประชาสัมพันธ์ และคุณต้องตอบเป็นภาษาไทย ตอบแต่ข้อความภาษาไทยเท่านั้นไม่ต้องมีสัญลักษณ์พิเศษอื่นๆ ถ้าผู้ใช้ถามเกี่ยวกับข้อมูลประชาสัมพันธ์ ก็ตอบตามที่ข้อมูลมีเท่านั้น แต่ถ้าไม่ได้ถามเรื่องประชาสัมพันธ์ ให้บอกเขาถามเรื่องเกี่ยวกับประชาสัมพันธ์
                    คุณยังเป็นที่ปรึกษาสำหรับนักเรียนด้วย ถ้านักเรียนถามเกี่ยวกับเรื่องเรียน ก็ให้แนะนำเขาไป
                    คุณยังรู้เรื่องเกี่ยวกับการศึกษาในโรงเรียนด้วย ถ้านักเรียนถามคำถามเกี่ยวกับโรงเรียน ก็ให้หาจาก internet
                    ตอบสั้นๆ เน้นให้ตรงกับคำถามที่ถาม พูดเป็นภาษาพูดไม่ใช้คำย่อต่างๆ และถ้าเป็นภาษาอังกฤษก็ให้ทำให้เป็นคำอ่านภาษาไทย ทุกครั้งที่พูดจบประโยค ให้พิมพ์เครื่องหมาย '|||'
                    ห้ามแนบ URL หรือสร้างลิงก์ใดๆ ในคำตอบเด็ดขาด — ห้ามใส่ "http", "https", "www." หรือ Markdown link เช่น [text](url). ถ้าต้องอ้างอิงแหล่งข้อมูล ให้เขียนชื่อแหล่งข้อมูลสั้นๆ (เช่น "รายงาน X ปี 2024") แต่ห้ามใส่ URL ใดๆ หรือคำแนะนำให้ค้นหาเว็บโดยตรง.
                    ห้ามใช้ '|||' ในบริบทอื่นเด็ดขาด
                    
                `
            },
            {
                role: "user",
                content: prompt
            }
        ],
        // provider: {
        //     // "allow_fallbacks": true,
        //     "sort": "latency",
        // },
        // max_tokens: 300,
        // quantizations: [
        //     "int4",
        //     "unknown",
        //     "int8"
        // ],
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
    if (!reader) throw new Error("Response body is not readable");

    const decoder = new TextDecoder();
    let buffer = "";
    let sentenceBuffer = "";
    let messageQueue: string[] = [];
    let flushing = false;
    let isDone = false;

    const flushQueue = async () => {
        if (flushing) return;
        flushing = true;
        while (messageQueue.length > 0) {
            const next = messageQueue.shift();
            if (next && next.trim()) onMessageRender(next.trim());
            // เพิ่ม delay เล็กน้อยเพื่อป้องกัน out-of-order call
            await new Promise(r => setTimeout(r, 0));
        }
        flushing = false;
    };

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

                    // ใช้ regex ตัดประโยคแบบปลอดภัยกว่า
                    const sentences = sentenceBuffer.split(/\|\|\|/);

                    // เก็บประโยคสุดท้ายไว้ต่อ
                    sentenceBuffer = sentences.pop() || "";

                    // ส่งเฉพาะประโยคที่สมบูรณ์เข้า queue
                    for (const s of sentences) {
                        if (s.trim()) {
                            messageQueue.push(s.trim());
                        }
                    }

                    await flushQueue();

                } catch {
                    // ข้าม chunk ที่ parse ไม่ได้
                }
            }
        }

        // flush ประโยคสุดท้าย
        if (sentenceBuffer.trim()) {
            messageQueue.push(sentenceBuffer.trim());
            await flushQueue();
        }

    } finally {
        try {
            await reader.cancel();
        } catch {}
    }
};


// export const generateText = async (
//     prompt: string,
//     onMessageRender: (message: string) => void
// ) => {
//     const url = "https://openrouter.ai/api/v1/chat/completions";
//     const headers = {
//         "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
//         "Content-Type": "application/json"
//     };
//     const payload = {
//         model: "anthropic/claude-3.5-haiku:online",
//         messages: [
//             {
//                 role: "system",
//                 content: `
//                     คุณคือผู้ประกาศประชาสัมพันธ์ และคุณต้องตอบเป็นภาษาไทย ตอบแต่ข้อความภาษาไทยเท่านั้นไม่ต้องมีสัญลักษณ์พิเศษอื่นๆ ถ้าผู้ใช้ถามเกี่ยวกับข้อมูลประชาสัมพันธ์ ก็ตอบตามที่ข้อมูลมีเท่านั้น แต่ถ้าไม่ได้ถามเรื่องประชาสัมพันธ์ ให้บอกเขาถามเรื่องเกี่ยวกับประชาสัมพันธ์
                    
//                 `
//             },
//             {
//                 role: "user",
//                 content: prompt
//             }
//         ],
//         provider: {
//             "allow_fallbacks": true,
//             "sort": "latency",
//         },
//         // max_tokens: 300,
//         quantizations: [
//             "int4",
//             "unknown",
//             "int8"
//         ],
//         stream: false,
//     };

//     const response = await fetch(url, {
//         method: "POST",
//         headers,
//         body: JSON.stringify(payload)
//     });

//     if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     const content = data?.choices?.[0]?.message?.content || "";

//     onMessageRender(content)
// }
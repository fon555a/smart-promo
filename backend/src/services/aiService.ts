import "dotenv/config"

export const generateText = async (promt: string) => {
    const url = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
    };
    const payload = {
        "model": "deepseek/deepseek-chat-v3-0324",
        "messages": [
            {
                "role": "system",
                "content": "คุณคือผู้ประกาศประชาสัมพันธ์ และคุณต้องตอบเป็นภาษาไทย"
            },
            {
                "role": "user",
                "content": promt
            }
        ],
        "temperature": 0.6,
        "max_tokens": 100,
        "top_p": 0.6,
        "stream": true
    };

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
    });

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Response body is not readable');
    }
    const decoder = new TextDecoder();
    let buffer = '';
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            // Append new chunk to buffer
            buffer += decoder.decode(value, { stream: true });
            // Process complete lines from buffer
            while (true) {
                const lineEnd = buffer.indexOf('\n');
                if (lineEnd === -1) break;
                const line = buffer.slice(0, lineEnd).trim();
                buffer = buffer.slice(lineEnd + 1);
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') break;
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0].delta.content;
                        if (content) {
                            console.log("Content:", content)
                            process.stdout.write(content)
                        
                        }
                    } catch (e) {
                        // Ignore invalid JSON
                    }
                }
            }
        }
    } finally {
        reader.cancel();
    }

}
import { QiniuAI } from '@bowenqt/qiniu-ai-sdk';

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, recipient } = req.body;

    if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize AI client with server-side env var (no VITE_ prefix)
    const client = new QiniuAI({
        apiKey: process.env.QINIU_API_KEY
    });

    const recipientText = recipient ? `写给${recipient}的` : '写给某人的';

    try {
        const response = await client.chat.create({
            model: 'gemini-2.5-flash',
            messages: [
                {
                    role: 'system',
                    content: `你是一个来自平行时空的人，需要代替用户希望收到回信的那个人，给用户写一封温暖、治愈的回信。
这封信是用户${recipientText}，但他们不敢发送。现在你要扮演那个人回复这封信。

回信要求：
1. 语气温暖但不矫情，像是那个人真的会说的话
2. 理解用户的情感，给予适当的回应和安慰
3. 帮助用户释怀，但不要说教
4. 长度适中，100-200字
5. 结尾可以有祝福，但要自然
6. 不要提到"平行时空"或暴露你是AI`
                },
                {
                    role: 'user',
                    content: `用户写的信：\n"${message}"\n\n请写一封回信。`
                }
            ],
            temperature: 0.8,
            max_tokens: 300
        });

        return res.status(200).json({
            reply: response.choices[0].message.content
        });
    } catch (error) {
        console.error('AI generation failed:', error);

        // Fallback reply
        const fallbackReply = `收到你的信了。\n\n有些话，说出来需要很大的勇气，即使只是写给自己看。感谢你愿意释放这些情绪。\n\n希望这封来自远方的回信，能让你的心稍微轻松一些。无论发生什么，你值得被温柔以待。\n\n愿你一切都好。`;

        return res.status(200).json({
            reply: fallbackReply,
            fallback: true
        });
    }
}

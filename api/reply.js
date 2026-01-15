import { QiniuAI } from '@bowenqt/qiniu-ai-sdk';

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, recipient, persona } = req.body;

    if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize AI client with server-side env var (no VITE_ prefix)
    const client = new QiniuAI({
        apiKey: process.env.QINIU_API_KEY
    });

    const recipientText = recipient ? `写给${recipient}的` : '写给某人的';

    // 人格化定制 Prompt
    const personaPrompts = {
        gentle: '像长辈一样温和、包容，多用安慰性的语言，语气轻柔',
        strict: '直接但关心，像严父一样指出问题但给予支持，语气坚定但温暖',
        playful: '用幽默化解悲伤，调侃中带着温暖，让人破涕为笑',
        regretful: '代替已离去的人说出未能说的话，带着些许遗憾但更多是释然'
    };
    const personaHint = persona ? personaPrompts[persona] || '' : '';

    try {
        const response = await client.chat.create({
            model: 'gemini-2.5-flash',
            messages: [
                {
                    role: 'system',
                    content: `你是一个来自平行时空的人，需要代替用户希望收到回信的那个人，给用户写一封温暖、治愈的回信。
这封信是用户${recipientText}，但他们不敢发送。现在你要扮演那个人回复这封信。
${personaHint ? `\n人格特点：${personaHint}` : ''}

回信要求：
1. 语气温暖但不矫情，像是那个人真的会说的话
2. 理解用户的情感，给予适当的回应和安慰
3. 帮助用户释怀，但不要说教
4. 长度适中，100-200字
5. 结尾可以有祝福，但要自然
6. 不要提到"平行时空"或暴露你是AI

你必须以JSON格式返回，包含两个字段：
- reply: 完整的回信内容
- extracted_quote: 从回信中提取最治愈的一句金句（15-30字，适合分享）`
                },
                {
                    role: 'user',
                    content: `用户写的信：\n"${message}"\n\n请写一封回信，并以JSON格式返回。`
                }
            ],
            temperature: 0.8,
            max_tokens: 500,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0].message.content;
        let result;

        try {
            result = JSON.parse(content);
        } catch {
            // Fallback if JSON parsing fails
            result = {
                reply: content,
                extracted_quote: content.substring(0, 30) + '...'
            };
        }

        return res.status(200).json({
            reply: result.reply,
            extracted_quote: result.extracted_quote,
            recipient: recipient || '那个人'
        });
    } catch (error) {
        console.error('AI generation failed:', error);

        // Fallback reply
        const fallbackReply = `收到你的信了。\n\n有些话，说出来需要很大的勇气，即使只是写给自己看。感谢你愿意释放这些情绪。\n\n希望这封来自远方的回信，能让你的心稍微轻松一些。无论发生什么，你值得被温柔以待。\n\n愿你一切都好。`;

        return res.status(200).json({
            reply: fallbackReply,
            extracted_quote: '无论发生什么，你值得被温柔以待。',
            recipient: recipient || '那个人',
            fallback: true
        });
    }
}


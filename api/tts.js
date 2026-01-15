import { QiniuAI } from '@bowenqt/qiniu-ai-sdk';

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, voiceType } = req.body;

    if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'Text is required' });
    }

    // Initialize AI client
    const client = new QiniuAI({
        apiKey: process.env.QINIU_API_KEY
    });

    try {
        // 使用 SDK 的 TTS synthesize 方法
        const result = await client.tts.synthesize({
            text: text.substring(0, 1000), // 限制长度
            voice_type: voiceType || 'qiniu_zh_female_tmjxxy', // 甜美教学小源
            encoding: 'mp3',
            speed_ratio: 1.0
        });

        // 返回 base64 音频
        if (result.audio) {
            return res.status(200).json({
                success: true,
                audioBase64: result.audio,
                contentType: 'audio/mp3',
                duration: result.duration
            });
        } else {
            throw new Error('No audio in response');
        }
    } catch (error) {
        console.error('TTS generation failed:', error);

        return res.status(500).json({
            success: false,
            error: 'Failed to generate audio',
            message: error.message
        });
    }
}

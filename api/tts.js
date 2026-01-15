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
        // Call Qiniu TTS API
        // 使用温柔女声，适合治愈系回信
        const response = await client.post('/voice/tts', {
            request: {
                text: text.substring(0, 1000) // 限制长度
            },
            audio: {
                voice_type: voiceType || 'qiniu_zh_female_tmjxxy' // 甜美教学小源
            }
        });

        // 返回音频 URL 或 base64
        if (response.data?.audio_url) {
            return res.status(200).json({
                success: true,
                audioUrl: response.data.audio_url
            });
        } else if (response.data?.audio) {
            return res.status(200).json({
                success: true,
                audioBase64: response.data.audio,
                contentType: 'audio/mp3'
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

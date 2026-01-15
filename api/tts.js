import { QiniuAI } from '@bowenqt/qiniu-ai-sdk';

// 人设到音色的映射
const PERSONA_VOICE_MAP = {
    gentle: 'qiniu_zh_female_tmjxxy',      // 温柔的 - 甜美温柔
    strict: 'qiniu_zh_male_chengshuwenzhong', // 严厉的 - 成熟稳重
    playful: 'qiniu_zh_female_huopoqiaopi',   // 幽默的 - 活泼俏皮
    regretful: 'qiniu_zh_female_shenchenneilian' // 遗憾的 - 深沉内敛
};

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, voiceType, persona } = req.body;

    if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'Text is required' });
    }

    // Initialize AI client
    const client = new QiniuAI({
        apiKey: process.env.QINIU_API_KEY
    });

    // 根据人设选择音色（优先级：voiceType > persona mapping > default）
    const selectedVoice = voiceType || PERSONA_VOICE_MAP[persona] || 'qiniu_zh_female_tmjxxy';

    try {
        // 使用 SDK 的 TTS synthesize 方法
        const result = await client.tts.synthesize({
            text: text.substring(0, 1000), // 限制长度
            voice_type: selectedVoice,
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

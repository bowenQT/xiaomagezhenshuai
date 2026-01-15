import { QiniuAI } from '@bowenqt/qiniu-ai-sdk';

// 人设 × 性别 → 音色 映射矩阵
const VOICE_MATRIX = {
    gentle: {
        female: 'qiniu_zh_female_tmjxxy',    // 甜美教学小源
        male: 'qiniu_zh_male_wncwxz',        // 温暖沉稳学长
        default: 'qiniu_zh_female_wwxkjx'    // 温婉学科讲师
    },
    strict: {
        female: 'qiniu_zh_female_glktss',    // 干练课堂思思
        male: 'qiniu_zh_male_ybxknjs',       // 渊博学科男教师
        default: 'qiniu_zh_female_glktss'
    },
    playful: {
        female: 'qiniu_zh_female_kljxdd',    // 开朗教学督导
        male: 'qiniu_zh_male_tyygjs',        // 通用阳光讲师
        default: 'qiniu_zh_male_hllzmz'      // 活力率真萌仔
    },
    regretful: {
        female: 'qiniu_zh_female_wwxkjx',    // 温婉学科讲师
        male: 'qiniu_zh_male_wncwxz',        // 温暖沉稳学长
        default: 'qiniu_zh_female_wwkjby'    // 温婉课件配音
    }
};

// 默认音色（无人设选择时）
const DEFAULT_VOICES = {
    female: 'qiniu_zh_female_tmjxxy',
    male: 'qiniu_zh_male_wncwxz',
    default: 'qiniu_zh_female_tmjxxy'
};

/**
 * 动态选择音色
 * @param {string|null} persona - 人设类型
 * @param {string|null} gender - 性别 ('female' | 'male' | null)
 * @returns {string} 音色 ID
 */
function selectVoice(persona, gender) {
    const personaMap = VOICE_MATRIX[persona] || DEFAULT_VOICES;
    return personaMap[gender] || personaMap.default;
}

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, voiceType, persona, gender } = req.body;

    if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'Text is required' });
    }

    // Initialize AI client
    const client = new QiniuAI({
        apiKey: process.env.QINIU_API_KEY
    });

    // 动态选择音色（优先级：voiceType > persona×gender mapping > default）
    const selectedVoice = voiceType || selectVoice(persona, gender);

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

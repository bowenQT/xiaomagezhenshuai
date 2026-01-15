import { QiniuAI } from '@bowenqt/qiniu-ai-sdk';

// 人设到音色的映射
const PERSONA_VOICE_MAP = {
    // 温柔的 - 甜美温柔女声
    gentle: 'qiniu_zh_female_tmjxxy',
    // 严厉的 - 成熟稳重男声
    strict: 'qiniu_zh_male_chengshuwenzhong',
    // 幽默的 - 活泼俏皮女声
    playful: 'qiniu_zh_female_huopoqiaopi',
    // 遗憾的 - 深沉内敛男声（或女声）
    regretful: 'qiniu_zh_female_shenchenneilian',
    // 默认
    default: 'qiniu_zh_female_tmjxxy'
};

export default async function handler(req, res) {
    // GET - 获取音色列表
    if (req.method === 'GET') {
        const client = new QiniuAI({
            apiKey: process.env.QINIU_API_KEY
        });

        try {
            const voices = await client.tts.listVoices();

            return res.status(200).json({
                success: true,
                voices: voices,
                personaMapping: PERSONA_VOICE_MAP
            });
        } catch (error) {
            console.error('Failed to list voices:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to list voices',
                message: error.message,
                // 返回默认映射
                personaMapping: PERSONA_VOICE_MAP
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

// 导出映射供其他模块使用
export { PERSONA_VOICE_MAP };

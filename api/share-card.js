import { QiniuAI } from '@bowenqt/qiniu-ai-sdk';

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { quote, recipient, count } = req.body;

    if (!quote || quote.trim().length === 0) {
        return res.status(400).json({ error: 'Quote is required' });
    }

    // Initialize AI client
    const client = new QiniuAI({
        apiKey: process.env.QINIU_API_KEY
    });

    const recipientText = recipient || '那个人';
    const letterCount = count || Math.floor(Math.random() * 50000) + 10000;

    try {
        // Generate artistic share card using Gemini Image
        const imageResult = await client.image.generate({
            model: 'gemini-3.0-pro-image-preview',
            prompt: `Create a beautiful, ethereal share card for a healing letter app:

STYLE:
- Deep cosmic blue background (#0a0e17 to #111827 gradient)
- Scattered starlight particles and soft nebula effects
- Warm golden glow accents (#f59e0b, #ea580c)
- Vintage letter paper texture with slightly burned/charred edges
- Atmospheric and dreamlike, evoking parallel universe concept

CONTENT (render as elegant Chinese calligraphy-style text):
- Center: "${quote}"
- Bottom signature: "—— 来自平行时空的${recipientText}"
- Small footer text: "这是第 ${letterCount.toLocaleString()} 封寄往平行时空的信"

COMPOSITION:
- Vertical format 1080x1920 (social media portrait)
- Golden light rays emanating from the text
- Soft vignette effect
- Subtle floating ember particles
- Premium, healing, ceremonial aesthetic
- Suitable for sharing on social platforms like WeChat Moments or Xiaohongshu

DO NOT include any watermarks, logos, or promotional text.`,
            image_config: {
                aspect_ratio: '9:16',
                image_size: '2K'
            }
        });

        // Wait for result if async
        let finalResult = imageResult;
        if (imageResult.task_id) {
            finalResult = await client.image.waitForResult(imageResult, {
                timeoutMs: 120000
            });
        }

        // Extract image URL or base64
        const imageUrl = finalResult.data?.[0]?.url || finalResult.data?.[0]?.b64_json;

        if (!imageUrl) {
            throw new Error('No image generated');
        }

        return res.status(200).json({
            success: true,
            image: imageUrl,
            isBase64: !finalResult.data?.[0]?.url
        });

    } catch (error) {
        console.error('Share card generation failed:', error);

        return res.status(500).json({
            success: false,
            error: 'Failed to generate share card',
            message: error.message
        });
    }
}

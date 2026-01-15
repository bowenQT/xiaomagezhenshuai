/**
 * Supabase Client for 未发送信件焚烧炉
 * V1.2 余烬星空 & 回声墙
 */

// 使用环境变量（Vite 需要 VITE_ 前缀）
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://czlogfefraonwopbumyi.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// WebSocket 重连配置
const WS_RECONNECT_DELAY = 5000;
const WS_MAX_RETRIES = 5;

// Simple Supabase client (no SDK needed for basic operations)
export const supabase = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,

    // Insert a letter record
    async insertLetter(recipient, emotion) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/letters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ recipient, emotion })
        });

        if (!response.ok) {
            throw new Error(`Failed to insert letter: ${response.status}`);
        }

        return response.json();
    },

    // Get recent letters (for Ember Sky)
    async getRecentLetters(limit = 50) {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/letters?order=created_at.desc&limit=${limit}`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch letters: ${response.status}`);
        }

        return response.json();
    },

    // Get featured replies (for Echo Wall)
    async getFeaturedReplies(limit = 20) {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/featured_replies?order=featured_at.desc&limit=${limit}`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch featured replies: ${response.status}`);
        }

        return response.json();
    },

    // Subscribe to realtime updates with auto-reconnect
    subscribeToLetters(callback) {
        let retryCount = 0;
        let ws = null;

        const connect = () => {
            ws = new WebSocket(
                `wss://czlogfefraonwopbumyi.supabase.co/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`
            );

            ws.onopen = () => {
                retryCount = 0; // 重置重试计数
                // Subscribe to letters table
                ws.send(JSON.stringify({
                    topic: 'realtime:public:letters',
                    event: 'phx_join',
                    payload: {},
                    ref: '1'
                }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.event === 'INSERT' && data.payload?.record) {
                    callback(data.payload.record);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.onclose = () => {
                if (retryCount < WS_MAX_RETRIES) {
                    retryCount++;
                    console.warn(`WebSocket closed, reconnecting (${retryCount}/${WS_MAX_RETRIES})...`);
                    setTimeout(connect, WS_RECONNECT_DELAY);
                } else {
                    console.error('WebSocket max retries reached');
                }
            };
        };

        connect();

        return () => {
            retryCount = WS_MAX_RETRIES; // 阻止重连
            if (ws) ws.close();
        };
    },

    // Upload share card image to Supabase Storage
    async uploadShareCard(imageBlob, filename) {
        const response = await fetch(
            `${SUPABASE_URL}/storage/v1/object/share-cards/${filename}`,
            {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': imageBlob.type || 'image/png'
                },
                body: imageBlob
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to upload image: ${response.status}`);
        }

        // 返回公开 URL
        return `${SUPABASE_URL}/storage/v1/object/public/share-cards/${filename}`;
    }
};

export default supabase;


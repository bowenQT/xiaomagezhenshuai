/**
 * Supabase Client for 未发送信件焚烧炉
 * V1.2 余烬星空 & 回声墙
 */

const SUPABASE_URL = 'https://czlogfefraonwopbumyi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bG9nZmVmcmFvbndvcGJ1bXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Njc2MzQsImV4cCI6MjA4NDA0MzYzNH0.GXYZ2ZwhIw0JIUDGxBUpdHe9mwnOUz2zqYQBQ5B6Abc';

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

    // Subscribe to realtime updates (simplified SSE approach)
    subscribeToLetters(callback) {
        // Use Supabase Realtime via WebSocket
        const ws = new WebSocket(
            `wss://czlogfefraonwopbumyi.supabase.co/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`
        );

        ws.onopen = () => {
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

        return () => ws.close();
    }
};

export default supabase;

